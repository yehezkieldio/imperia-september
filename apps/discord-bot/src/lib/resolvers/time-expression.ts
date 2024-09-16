import { Result } from "@sapphire/framework";
import * as chrono from "chrono-node";
import dayjs, { type Dayjs } from "dayjs";

export function resolveTimeExpression(date: string): Result<number, string> {
    const parsedTime: Date | null = chrono.parseDate(date);
    if (!parsedTime) {
        return Result.err(date);
    }

    const time: Dayjs = dayjs(parsedTime);
    const seconds: number = time.second();

    return Result.ok(seconds);
}
