import { ArgumentError, Listener, type MessageCommandErrorPayload, UserError } from "@sapphire/framework";
import { ImperiaEvents } from "#lib/extensions/constants/events";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class MessageCommandErrorListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageCommandError,
        });
    }

    public async run(error: Error, payload: MessageCommandErrorPayload) {
        this.container.logger.debug(`MessageCommandErrorListener: ${error.name}\n- ${error}`);

        if (error instanceof UserError) {
            return this.userError(error, payload);
        }

        if (error instanceof ArgumentError) {
            return this.argumentError(error, payload);
        }
    }

    private async userError(error: UserError, payload: MessageCommandErrorPayload) {
        this.container.logger.debug(`MessageCommandErrorListener: ${error.identifier}`);

        if (error.identifier === ImperiaIdentifiers.ArgsMissing) {
            return payload.message.reply({
                content: error.message,
            });
        }

        if (error.identifier === ImperiaIdentifiers.CommandServiceError) {
            return payload.message.reply({
                content: error.message,
            });
        }

        return payload.message.reply({
            content: error.message,
        });
    }

    private async argumentError(error: ArgumentError, payload: MessageCommandErrorPayload) {
        this.container.logger.debug(`MessageCommandErrorListener: ${error.identifier}`);

        return payload.message.reply({
            content: error.message,
        });
    }
}
