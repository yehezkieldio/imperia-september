import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { type Message, SlashCommandBuilder } from "discord.js";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaEmbedBuilder } from "#lib/extensions/embed-builder";

export class AestheticCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Turn your text into an aesthetically pleasing fullwidth text.",
            aliases: ["fullwidth"],
            tags: ["text", "fun"],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) =>
                option.setName("text").setDescription("The text to convert.").setRequired(true),
            );

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const text: string = interaction.options.getString("text", true);
        const embed = new ImperiaEmbedBuilder().setTheme("success");

        const convertedText: string = this.#convertToFullwidth(text);
        embed.setDescription(convertedText);

        return interaction.reply({
            embeds: [embed],
        });
    }

    public async messageRun(message: Message, args: Args) {
        const textArgument: ResultType<string> = await args.restResult("string");

        if (textArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: await resolveKey(message, "aesthetic:no_text"),
            });
        }

        const text: string = textArgument.unwrap();
        const embed = new ImperiaEmbedBuilder().setTheme("success");

        const convertedText: string = this.#convertToFullwidth(text);
        embed.setDescription(convertedText);

        return message.reply({
            embeds: [embed],
        });
    }

    /* -------------------------------------------------------------------------- */

    #convertToFullwidth(text: string): string {
        return text.replace(/[!-~]/g, (char: string): string => {
            const code: number = char.charCodeAt(0);
            return String.fromCharCode(code + 0xfee0);
        });
    }
}
