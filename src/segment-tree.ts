export type AgentId = string;

export class SegmentTree {
    private readonly tree: Map<AgentId, number>[];
    private readonly size: number;

    constructor(size: number) {
        this.size = size;
        this.tree = Array.from({ length: 4 * size }, () => new Map<AgentId, number>());
    };

    addRange(start: number, end: number, agentId: AgentId) {
        if (start >= end) {
            throw new Error("Invalid range");
        }
        this.updateRange(0, 0, this.size - 1, start, end - 1, agentId, 1);
    };

    removeRange(start: number, end: number, agentId: AgentId) {
        if (start >= end) {
            throw new Error("Invalid range");
        }
        this.updateRange(0, 0, this.size - 1, start, end - 1, agentId, -1);
    };

    query(time: number): AgentId[] {
        if (time < 0 || time >= this.size) {
            throw new Error("Invalid time");
        }
        const agents = new Set<AgentId>();
        this.queryPoint(0, 0, this.size - 1, time, agents);
        return [...agents];
    };

    private updateRange(nodeIndex: number, rangeStart: number, rangeEnd: number, updateStart: number, updateEnd: number, agentId: AgentId, delta: number) {
        if (rangeStart > updateEnd || rangeEnd < updateStart) {
            return;
        }

        if (updateStart <= rangeStart && rangeEnd <= updateEnd) {
            const currentCount = this.tree[nodeIndex]!.get(agentId) ?? 0;
            const newCount = currentCount + delta;
            if (newCount <= 0) {
                this.tree[nodeIndex]!.delete(agentId);
            } else {
                this.tree[nodeIndex]!.set(agentId, newCount);
            };
            return;
        }

        const middle = Math.floor((rangeStart + rangeEnd) / 2);

        const leftChild = 2 * nodeIndex + 1;
        const rightChild = 2 * nodeIndex + 2;

        this.updateRange(leftChild, rangeStart, middle, updateStart, updateEnd, agentId, delta);
        this.updateRange(rightChild, middle + 1, rangeEnd, updateStart, updateEnd, agentId, delta);
    };

    private queryPoint(nodeIndex: number, rangeStart: number, rangeEnd: number, time: number, result: Set<AgentId>) {
        for (const agentId of this.tree[nodeIndex]!.keys()) {
            result.add(agentId);
        }

        if (rangeStart === rangeEnd) {
            return;
        }

        const middle = Math.floor((rangeStart + rangeEnd) / 2);

        if (time <= middle) {
            this.queryPoint(2 * nodeIndex + 1, rangeStart, middle, time, result);
        } else {
            this.queryPoint(2 * nodeIndex + 2, middle + 1, rangeEnd, time, result);
        }
    };
}