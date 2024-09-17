import { AllFlowsPrecondition, type Result, type UserError } from "@sapphire/framework";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class EnforceBlacklistPrecondition extends AllFlowsPrecondition {
    public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
        super(context, {
            ...options,
            position: 22,
        });
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction) {
        if (interaction.guildId === null) return this.ok();

        return this.doDisabledListCheck(interaction.commandName, interaction.guildId);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
        if (interaction.guildId === null) return this.ok();

        return this.doDisabledListCheck(interaction.commandName, interaction.guildId);
    }

    public async messageRun(message: Message) {
        if (message.guildId === null) return this.ok();

        const commandName = await this.container.utilities.bot.getCommandFromContent(message);
        this.container.logger.debug(`Command name: ${commandName}`);

        if (!commandName) return this.ok();

        return this.doDisabledListCheck(commandName, message.guildId);
    }

    /* -------------------------------------------------------------------------- */

    private async doDisabledListCheck(commandName: string, guildId: string): Promise<Result<unknown, UserError>> {
        const commands: string[] = await this.container.utilities.guild.getDisabledCommands(guildId);

        if (commands.includes(commandName)) {
            return this.error({
                identifier: ImperiaIdentifiers.CommandGuildDisabled,
            });
        }

        return this.ok();
    }
}
