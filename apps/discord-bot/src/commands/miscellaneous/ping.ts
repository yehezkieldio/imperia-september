import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { type Message, SlashCommandBuilder } from "discord.js";

import { resolveKey } from "@sapphire/plugin-i18next";
import { ImperiaCommand } from "#lib/extensions/command";

export class PingCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Check the bot's latency.",
            tags: ["utility"],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const pleaseWait: string = await resolveKey(interaction, "ping:please_wait");
        const failed: string = await resolveKey(interaction, "ping:failed");

        const msg: Message = await interaction.reply({
            content: pleaseWait,
            fetchReply: true,
        });

        if (isMessageInstance(msg)) {
            const context: ImperiaCommand.MessageContext = msg;
            const response: string = await this.getLatency(msg, context);

            return msg.edit(response);
        }

        return interaction.editReply(failed);
    }

    public async messageRun(message: Message) {
        const pleaseWait: string = await resolveKey(message, "ping:please_wait");
        const failed: string = await resolveKey(message, "ping:failed");

        const msg: Message = await message.reply(pleaseWait);

        if (isMessageInstance(msg)) {
            const context: ImperiaCommand.MessageContext = msg;
            const response: string = await this.getLatency(msg, context);

            return msg.edit(response);
        }

        return message.edit(failed);
    }

    /* -------------------------------------------------------------------------- */

    private async getLatency(message: Message, context: ImperiaCommand.MessageContext) {
        const diff: number = message.createdTimestamp - context.createdTimestamp;
        const ping: number = Math.round(this.container.client.ws.ping);

        return `Heartbeat: ${ping}ms, Roundtrip: ${diff}ms.`;
    }
}
