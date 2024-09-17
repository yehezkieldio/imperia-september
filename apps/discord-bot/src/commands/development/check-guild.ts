import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import type { Message } from "discord.js";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaEvents } from "#lib/extensions/constants/events";

export class CheckGuildCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "A command that fire up an guild join event to simulate a guild join event.",
            preconditions: ["DeveloperUserOnly"],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    /* -------------------------------------------------------------------------- */

    public async messageRun(message: Message) {
        if (!message.guild) return;
        this.container.client.emit(ImperiaEvents.GuildCreate, message.guild);

        return message.reply("Fired guild join event.");
    }
}