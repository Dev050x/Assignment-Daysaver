import { AvailabilityService } from "./availability-service";

const service = new AvailabilityService();

service.addAgent({
    id: "A",
    windows: [
        {
            id: "A1",
            start: "09:00",
            end: "12:00"
        },
        {
            id: "A2",
            start: "13:00",
            end: "17:00"
        }
    ]
});

service.addAgent({
    id: "B",
    windows: [
        {
            id: "B1",
            start: "10:00",
            end: "14:00"
        },
        {
            id: "B2",
            start: "13:30",
            end: "18:00"
        }
    ]
});

console.log(await service.findAvailableAgents("11:30"));
