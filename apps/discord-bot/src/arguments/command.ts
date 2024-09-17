import { Argument, type Result } from "@sapphire/framework";
import type { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { resolveCommand } from "#lib/resolvers/command";

export class CommandArgument extends Argument<ImperiaCommand> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "command" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<ImperiaCommand> {
        const command: Result<ImperiaCommand, undefined> = resolveCommand(argument);

        if (command.isErr()) {
            return this.error({
                context,
                parameter: argument,
                identifier: ImperiaIdentifiers.ArgumentCommandError,
            });
        }

        return this.ok(command.unwrap());
    }
}
