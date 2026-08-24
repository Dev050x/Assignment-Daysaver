import { describe, it, expect } from "bun:test";
import { AvailabilityService } from "../src/availability-service";

describe("Agent and window scalability", () => {
    it("should handle a large number of agents", async () => {
        const service = new AvailabilityService();

        for (let i = 0; i < 1000; i++) {
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

        const agents = await service.findAvailableAgents("12:00");

        expect(agents).toHaveLength(1000);
        expect(agents).toContain("agent-0");
        expect(agents).toContain("agent-999");
    });

    it("should handle an agent with many availability windows", async () => {
        const service = new AvailabilityService();

        const windows = Array.from({ length: 24 }, (_, i) => ({
            id: `window-${i}`,
            start: `${String(i).padStart(2, "0")}:00`,
            end: `${String(i + 1).padStart(2, "0")}:00`,
        }));

        await service.addAgent({
            id: "agent-1",
            windows,
        });

        expect(
            await service.findAvailableAgents("12:30")
        ).toContain("agent-1");
    });

    it("should handle many agents with multiple windows", async () => {
        const service = new AvailabilityService();

        for (let agent = 0; agent < 500; agent++) {
            await service.addAgent({
                id: `agent-${agent}`,
                windows: [
                    {
                        id: `${agent}-morning`,
                        start: "09:00",
                        end: "12:00",
                    },
                    {
                        id: `${agent}-afternoon`,
                        start: "13:00",
                        end: "17:00",
                    },
                ],
            });
        }

        expect(
            await service.findAvailableAgents("10:00")
        ).toHaveLength(500);

        expect(
            await service.findAvailableAgents("14:00")
        ).toHaveLength(500);
    });
});