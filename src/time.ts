export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);

    if (
        hours === undefined ||
        minutes === undefined ||
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 24 ||
        minutes < 0 ||
        minutes > 59 ||
        (hours === 24 && minutes > 0)
    ) {
        throw new Error(`Invalid time: ${time}`);
    }

    return hours * 60 + minutes;
}