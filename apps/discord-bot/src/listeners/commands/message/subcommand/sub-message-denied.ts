import { Listener, type UserError } from "@sapphire/framework";
import type { MessageSubcommandDeniedPayload } from "@sapphire/plugin-subcommands";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageSubcommandDeniedListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageSubcommandDenied,
        });
    }

    public async run(error: UserError, payload: MessageSubcommandDeniedPayload) {
        const { message } = payload;
        if (!message.guildId) return;

        this.container.logger.debug(`MessageSubcommandDeniedListener: ${error.identifier}`);

        const response: string = await this.container.services.response.commandDenied(message.guildId, error);

        return message.reply({
            content: await this.container.utilities.bot.getResponse(response, message),
        });
    }
}
