# Agent Availability Service

A high-performance, concurrent Agent Availability Service built with **Bun** and **TypeScript**. It leverages a **Segment Tree** for fast interval range queries across time windows (1,440 minutes/day) and an async **RWLock** primitive for thread-safe concurrent reads and writes.

---

## Features

- **Segment Tree Indexing**: Fast range updates and point queries for time-of-day availability windows.
- **Concurrent RWLock**: Async Reader-Writer lock allowing concurrent availability reads while serializing updates safely.
- **Agent & Window Management**: Add agents, remove agents, or update availability schedules dynamically.
- **High Throughput**: Handles ~1,200 req/sec in read-heavy workloads and ~1,000 req/sec in mixed workloads with zero errors across 1,000 agents.

---

## Project Structure

```
├── src/
│   ├── availability-service.ts  # Main AvailabilityService class
│   ├── segment-tree.ts          # Segment Tree range query engine
│   ├── rw-lock.ts               # Reader-Writer Lock concurrency primitive
│   ├── time.ts                  # HH:MM time conversion utility
│   ├── models.ts                # TypeScript interfaces and types
│   └── index.ts                 # Quick demo script
├── test/                        # Unit and integration test suite
├── benchmark/
│   └── load-test.ts             # Load testing benchmark
└── assets/
    └── benchmark-results.png    # Benchmark result screenshot
```

---

## Getting Started

### Prerequisites

Ensure [Bun](https://bun.com) is installed on your system.

### Installation

```bash
bun install
```

### Running the Demo

```bash
bun run src/index.ts
```

---

## Testing & Benchmarking

### Run Test Suite

```bash
bun test
```

### Run Benchmark Load Test

```bash
bun run benchmark/load-test.ts
```

---

## Benchmark Results

The load test evaluates throughput (requests per second) for 1,000 agents under concurrent read-heavy and mixed read-write scenarios.

| Scenario | Agents | Duration | Completed Requests | Target RPS | Actual RPS | Errors |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Read-Heavy** | 1,000 | ~10s | 12,000 | 1,000 req/s | **1,199.30 req/s** | 0 |
| **Mixed Workload** | 1,000 | ~10s | 10,000 | 1,000 req/s | **999.11 req/s** | 0 |

### Terminal Benchmark Output

![Benchmark Results](assets/benchmark-results.png)
