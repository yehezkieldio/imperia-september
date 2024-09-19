import { type Args, Listener } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import type { MessageSubcommandNoMatchContext } from "@sapphire/plugin-subcommands";
import type { Message } from "discord.js";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class MessageSubcommandNoMatchListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: false,
            event: ImperiaEvents.MessageSubcommandNoMatch,
        });
    }

    public async run(message: Message, _args: Args, _context: MessageSubcommandNoMatchContext) {
        return message.reply({
            content: await resolveKey(message, "response:no_subcommand_match"),
        });
    }
}
