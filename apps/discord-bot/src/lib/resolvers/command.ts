import { Result, container } from "@sapphire/framework";
import type { ImperiaCommand } from "#lib/extensions/command";

export function resolveCommand(commandName: string): Result<ImperiaCommand, undefined> {
    const command = container.stores.get("commands").get(commandName.toLowerCase()) as ImperiaCommand | undefined;

    if (command === undefined) {
        return Result.err(undefined);
    }

    return Result.ok(command);
}
