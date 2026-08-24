import { AvailabilityService } from "../src/availability-service";

const AGENT_COUNT = 1000;
const DURATION_MS = 10_000;
const TARGET_RPS = 1200;

async function createService() {
  const service = new AvailabilityService();

  for (let i = 0; i < AGENT_COUNT; i++) {
    await service.addAgent({
      id: `agent-${i}`,
      windows: [
        {
          id: `window-${i}`,
          start: "09:00",
          end: "17:00",
        },
      ],
    });
  }

  return service;
}

async function runReadLoadTest(service: AvailabilityService) {
  let completed = 0;
  let errors = 0;
  const start = performance.now();
  const end = start + DURATION_MS;

  while (performance.now() < end) {
    const batchStart = performance.now();

    const requests = Array.from({ length: TARGET_RPS }, async () => {
      try {
        await service.findAvailableAgents("12:00");
        completed++;
      } catch {
        errors++;
      }
    });

    await Promise.all(requests);

    const batchDuration = performance.now() - batchStart;

    if (batchDuration < 1000) {
      await Bun.sleep(1000 - batchDuration);
    }
  }

  const elapsedSeconds = (performance.now() - start) / 1000;
  const actualRps = completed / elapsedSeconds;

  return {
    scenario: "read-heavy",
    agents: AGENT_COUNT,
    durationSeconds: elapsedSeconds,
    completed,
    errors,
    actualRps,
  };
}

async function runMixedLoadTest(service: AvailabilityService) {
  const durationMs = DURATION_MS;
  const start = performance.now();
  const end = start + durationMs;

  let reads = 0;
  let updates = 0;
  let errors = 0;

  while (performance.now() < end) {
    const batchStart = performance.now();

    const readRequests = Array.from({ length: 900 }, async () => {
      try {
        await service.findAvailableAgents("12:00");
        reads++;
      } catch {
        errors++;
      }
    });

    const updateRequests = Array.from({ length: 100 }, async (_, i) => {
      try {
        const agentId = `agent-${i}`;

        await service.updateAvailability(agentId, [
          {
            id: `updated-${Date.now()}-${i}`,
            start: "09:00",
            end: "17:00",
          },
        ]);

        updates++;
      } catch {
        errors++;
      }
    });

    await Promise.all([...readRequests, ...updateRequests]);

    const batchDuration = performance.now() - batchStart;

    if (batchDuration < 1000) {
      await Bun.sleep(1000 - batchDuration);
    }
  }

  const elapsedSeconds = (performance.now() - start) / 1000;
  const total = reads + updates;

  return {
    scenario: "mixed",
    agents: AGENT_COUNT,
    durationSeconds: elapsedSeconds,
    reads,
    updates,
    total,
    errors,
    actualRps: total / elapsedSeconds,
  };
}

async function main() {
  console.log("Preparing availability service...");

  const service = await createService();

  console.log("\nRunning read-heavy test...");
  const readResult = await runReadLoadTest(service);
  console.table(readResult);

  console.log("\nRunning mixed workload test...");
  const mixedResult = await runMixedLoadTest(service);
  console.table(mixedResult);

  console.log("\nTarget: 1000 requests/sec");
  console.log(`Read-heavy: ${readResult.actualRps.toFixed(2)} req/sec`);
  console.log(`Mixed:       ${mixedResult.actualRps.toFixed(2)} req/sec`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
