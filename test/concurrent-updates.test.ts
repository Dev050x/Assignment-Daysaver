import { describe, it, expect } from "bun:test";
import { AvailabilityService } from "../src/availability-service";

describe("Concurrent availability operations", () => {
    it("should allow multiple availability queries concurrently", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "17:00",
                },
            ],
        });

        const results = await Promise.all([
            service.findAvailableAgents("10:00"),
            service.findAvailableAgents("11:00"),
            service.findAvailableAgents("12:00"),
            service.findAvailableAgents("13:00"),
        ]);

        for (const result of results) {
            expect(result).toEqual(["A"]);
        }
    });

    it("should expose only the new availability after an update completes", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "17:00",
                },
            ],
        });

        await service.updateAvailability("A", [
            {
                id: "A2",
                start: "09:00",
                end: "11:00",
            },
            {
                id: "A3",
                start: "13:00",
                end: "17:00",
            },
        ]);

        expect(
            await service.findAvailableAgents("10:00")
        ).toEqual(["A"]);

        expect(
            await service.findAvailableAgents("12:00")
        ).toEqual([]);

        expect(
            await service.findAvailableAgents("14:00")
        ).toEqual(["A"]);
    });

    it("should serialize concurrent updates", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "17:00",
                },
            ],
        });

        await Promise.all([
            service.updateAvailability("A", [
                {
                    id: "A2",
                    start: "08:00",
                    end: "10:00",
                },
            ]),
            service.updateAvailability("A", [
                {
                    id: "A3",
                    start: "14:00",
                    end: "18:00",
                },
            ]),
        ]);

        const morning =
            await service.findAvailableAgents("09:00");

        const afternoon =
            await service.findAvailableAgents("15:00");

        expect(
            morning.length === 1 ||
            afternoon.length === 1
        ).toBe(true);
    });

    it("should remain consistent when a remove happens while reads are running", async () => {
        const service = new AvailabilityService();

        await service.addAgent({
            id: "A",
            windows: [
                {
                    id: "A1",
                    start: "09:00",
                    end: "17:00",
                },
            ],
        });

        await Promise.all([
            service.findAvailableAgents("10:00"),
            service.findAvailableAgents("11:00"),
            service.removeAgent("A"),
        ]);

        expect(
            await service.findAvailableAgents("12:00")
        ).toEqual([]);
    });
});