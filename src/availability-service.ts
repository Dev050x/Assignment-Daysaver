import type { Agent, AvailabilityWindow } from "./models";
import { SegmentTree } from "./segment-tree";
import { timeToMinutes } from "./time";
import { RWLock } from "./rw-lock";

export class AvailabilityService {
  private readonly agents = new Map<string, Agent>();
  private readonly availabilityIndex: SegmentTree;
  private readonly lock = new RWLock();

  constructor() {
    this.availabilityIndex = new SegmentTree(1440);
  }

  async addAgent(agent: Agent) {
    await this.lock.acquireWrite();

    try {
      if (this.agents.has(agent.id)) {
        throw new Error(`Agent ${agent.id} already exists`);
      }

      for (const window of agent.windows) {
        this.availabilityIndex.addRange(
          timeToMinutes(window.start),
          timeToMinutes(window.end),
          agent.id
        );
      }

      this.agents.set(agent.id, agent);
    } finally {
      this.lock.releaseWrite();
    }
  }

  async removeAgent(agentId: string) {
    await this.lock.acquireWrite();

    try {
      const agent = this.agents.get(agentId);

      if (!agent) {
        return;
      }

      for (const window of agent.windows) {
        this.availabilityIndex.removeRange(
          timeToMinutes(window.start),
          timeToMinutes(window.end),
          agentId
        );
      }

      this.agents.delete(agentId);
    } finally {
      this.lock.releaseWrite();
    }
  }

  async updateAvailability(
    agentId: string,
    newWindows: AvailabilityWindow[]
  ) {
    await this.lock.acquireWrite();

    try {
      const agent = this.agents.get(agentId);

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      for (const window of agent.windows) {
        this.availabilityIndex.removeRange(
          timeToMinutes(window.start),
          timeToMinutes(window.end),
          agentId
        );
      }

      for (const window of newWindows) {
        this.availabilityIndex.addRange(
          timeToMinutes(window.start),
          timeToMinutes(window.end),
          agentId
        );
      }

      agent.windows = newWindows;
    } finally {
      this.lock.releaseWrite();
    }
  }

  async findAvailableAgents(time: string) {
    await this.lock.acquireRead();

    try {
      const minute = timeToMinutes(time);

      return this.availabilityIndex.query(minute);
    } finally {
      this.lock.releaseRead();
    }
  }
}