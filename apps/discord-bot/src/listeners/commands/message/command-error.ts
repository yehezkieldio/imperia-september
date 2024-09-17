import { ArgumentError, Listener, type MessageCommandErrorPayload, UserError } from "@sapphire/framework";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: Error, payload: MessageCommandErrorPayload) {
        const { message } = payload;
        if (!message.guildId) return;

        if (error instanceof UserError) {
            this.container.logger.debug(`MessageCommandErrorListener: UserError ${error.identifier}`);
        }

        if (error instanceof ArgumentError) {
            this.container.logger.debug(`MessageCommandErrorListener: ArgumentError ${error.identifier}`);
        }

        const response: string = await this.container.services.response.commandError(message.guildId, error);

        return message.reply({
            content: await this.container.utilities.bot.getResponse(response, message),
        });
    }
}
