export type AvailabilityWindow = {
    id: string;
    start: string;
    end: string;
};

export type Agent = {
    id: string;
    windows: AvailabilityWindow[];
};