import { ArgumentError, Listener, UserError } from "@sapphire/framework";
import type { ChatInputSubcommandErrorPayload } from "@sapphire/plugin-subcommands";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class ChatInputSubcommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputSubcommandError,
        });
    }

    public async run(error: Error, payload: ChatInputSubcommandErrorPayload) {
        const { interaction } = payload;
        if (!interaction.guildId) return;

        if (error instanceof UserError) {
            this.container.logger.debug(`ChatInputSubcommandErrorListener: UserError ${error.identifier}`);
        }

        if (error instanceof ArgumentError) {
            this.container.logger.debug(`ChatInputSubcommandErrorListener: ArgumentError ${error.identifier}`);
        }

        const response: string = await this.container.services.response.commandError(interaction.guildId, error);

        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: await this.container.utilities.bot.getResponse(response, interaction),
            });
        }

        return interaction.reply({
            content: await this.container.utilities.bot.getResponse(response, interaction),
            ephemeral: true,
        });
    }
}
