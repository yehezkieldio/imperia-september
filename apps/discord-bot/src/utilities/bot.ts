import { Utility } from "@imperia/stores";
import type { UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import {
    ChannelType,
    type CommandInteraction,
    type Guild,
    type Message,
    chatInputApplicationCommandMention,
    inlineCode,
} from "discord.js";

export class BotUtility extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "bot",
        });
    }

    public getChannelType(error: UserError) {
        const channelType = Reflect.get(Object(error.context), "types") as number[];

        if (channelType.includes(ChannelType.GuildText)) return "server text channel.";
        if (channelType.includes(ChannelType.DM)) return "DM channel.";

        return "valid channel.";
    }

    public getMissingPermissions(error: UserError) {
        const missing = Reflect.get(Object(error.context), "missing") as string[];

        return missing.map((perm) => inlineCode(perm)).join(" ");
    }

    public getCommandMention = (commandName: string): string | `</${string}:${string}>` => {
        const command = this.container.applicationCommandRegistries.acquire(commandName);
        const commandId = command.globalChatInputCommandIds.values().next().value;

        if (!commandId) return `/${commandName}`;

        return chatInputApplicationCommandMention(command.commandName, commandId);
    };

    public getUserAsGuildMember = async (userId: string, guild: Guild) => {
        return guild?.members.cache.get(userId) ?? guild?.members.fetch(userId);
    };

    public getUserFromId = async (userId: string) => {
        return await this.container.client.users.fetch(userId);
    };

    public getGuildFromId = async (guildId: string) => {
        return await this.container.client.guilds.fetch(guildId);
    };

    public getResolveKey = async (guildId: string) => {
        const languageCode = await this.container.utilities.guild.getLanguage(guildId);
        const resolveKey = this.container.i18n.getT(languageCode);

        return resolveKey;
    };

    public isATranslationKey = (key: string) => {
        /**
         * We check if a response string contains a colon, which is the separator for translation keys.
         * Example: `response:server_only`
         * If it does, we assume it's a translation key.
         */
        return /^(\w+):(\w+)$/.test(key);
    };

    public getResponse(response: string, messageOrInteraction: Message | CommandInteraction) {
        return this.isATranslationKey(response) ? resolveKey(messageOrInteraction, response) : response;
    }
}
