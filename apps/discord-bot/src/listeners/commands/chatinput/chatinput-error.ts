import { ArgumentError, type ChatInputCommandErrorPayload, Listener, UserError } from "@sapphire/framework";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class ChatInputCommadErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.ChatInputCommandError,
        });
    }

    public async run(error: Error, payload: ChatInputCommandErrorPayload) {
        const { interaction } = payload;
        if (!interaction.guildId) return;

        if (error instanceof UserError) {
            this.container.logger.debug(`ChatInputCommadErrorListener: UserError ${error.identifier}`);
        }

        if (error instanceof ArgumentError) {
            this.container.logger.debug(`ChatInputCommadErrorListener: ArgumentError ${error.identifier}`);
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
