import { Precondition, type Result, type UserError } from "@sapphire/framework";
import type { CommandInteraction, Message } from "discord.js";
import { DEVELOPERS } from "#lib/configuration";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class DeveloperUserOnlyPrecondition extends Precondition {
    public constructor(context: Precondition.LoaderContext, options: Precondition.Options) {
        super(context, {
            ...options,
            name: ImperiaIdentifiers.DeveloperUserOnly,
        });
    }

    public async chatInputRun(interaction: CommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doDevelopersCheck(interaction.user.id);
    }

    public async messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doDevelopersCheck(message.author.id);
    }

    /* -------------------------------------------------------------------------- */

    private async doDevelopersCheck(userId: string): Promise<Result<unknown, UserError>> {
        return DEVELOPERS.includes(userId)
            ? this.ok()
            : this.error({
                  message: "This command is restricted to developers only!",
                  identifier: ImperiaIdentifiers.DeveloperUserOnly,
              });
    }
}
