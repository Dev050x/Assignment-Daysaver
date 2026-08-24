import { describe, it, expect } from "bun:test";
import { AvailabilityService } from "../src/availability-service";

describe("Overlapping availability windows", () => {
    it("should return an agent only once when windows overlap", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "13:00",
                },
                {
                    id: "A2",
                    start: "11:00",
                    end: "15:00",
                },
            ],
        });

        const agents =
            await service.findAvailableAgents("12:00");

        expect(agents).toEqual(["A"]);
    });

    it("should keep agent available after removing one overlapping window", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "13:00",
                },
                {
                    id: "A2",
                    start: "11:00",
                    end: "15:00",
                },
            ],
        });

        await service.updateAvailability("A", [
            {
                id: "A2",
                start: "11:00",
                end: "15:00",
            },
        ]);

        expect(
            await service.findAvailableAgents("12:00")
        ).toEqual(["A"]);
    });

    it("should make agent unavailable after removing all windows", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "13:00",
                },
                {
                    id: "A2",
                    start: "11:00",
                    end: "15:00",
                },
            ],
        });

        await service.updateAvailability("A", []);

        expect(
            await service.findAvailableAgents("12:00")
        ).toEqual([]);
    });

    it("should handle overlapping windows from multiple agents", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "13:00",
                },
                {
                    id: "A2",
                    start: "11:00",
                    end: "15:00",
                },
            ],
        });

        await service.addAgent({
            id: "B",
            windows: [
                {
                    id: "B1",
                    start: "12:00",
                    end: "14:00",
                },
            ],
        });

        const agents =
            await service.findAvailableAgents("12:30");

        expect(new Set(agents)).toEqual(
            new Set(["A", "B"])
        );
    });
});