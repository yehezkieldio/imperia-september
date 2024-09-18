import { ArgumentError, Listener, UserError } from "@sapphire/framework";
import type { MessageSubcommandErrorPayload } from "@sapphire/plugin-subcommands";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageSubcommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageSubcommandError,
        });
    }

    public async run(error: Error, payload: MessageSubcommandErrorPayload) {
        const { message } = payload;
        if (!message.guildId) return;

        if (error instanceof UserError) {
            this.container.logger.debug(`MessageSubcommandErrorListener: UserError ${error.identifier}`);
        }

        if (error instanceof ArgumentError) {
            this.container.logger.debug(`MessageSubcommandErrorListener: ArgumentError ${error.identifier}`);
        }

        const response: string = await this.container.services.response.commandError(message.guildId, error);

        return message.reply({
            content: await this.container.utilities.bot.getResponse(response, message),
        });
    }
}
