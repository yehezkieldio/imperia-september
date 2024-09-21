import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { resolveKey } from "@sapphire/plugin-i18next";
import { Time, TimerManager } from "@sapphire/time-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message, SlashCommandBuilder } from "discord.js";
import { UserAgreementStatus } from "#interactions/user-agreement";
import { ImperiaCommand } from "#lib/extensions/command";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { ImperiaEmbedBuilder } from "#lib/extensions/embed-builder";

export class RegisterUserCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.LoaderContext, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Register yourself as a user in the database of the bot.",
            aliases: ["register"],
            tags: ["user"],
            preconditions: [ImperiaIdentifiers.DeveloperUserOnly],
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            generateDashLessAliases: true,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command);
    }

    /* -------------------------------------------------------------------------- */

    public async messageRun(message: Message): Promise<void> {
        const registerCommand: string = this.container.utilities.bot.getCommandMention("register");

        const msg: Message = await message.reply({
            content: await resolveKey(message, "register-user:prefer_slash", { command: registerCommand }),
        });

        TimerManager.setTimeout((): void => {
            if (msg.deletable) msg.delete();
        }, Time.Second * 5);
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<undefined | Message> {
        await interaction.deferReply({
            ephemeral: true,
        });

        const user = await this.container.utilities.user.get(interaction.user.id);
        if (user !== null) {
            return interaction.editReply({
                content: await resolveKey(interaction, "register-user:already_registered"),
            });
        }

        const { embed, components } = await this.#generateAgreement(interaction);

        interaction.editReply({
            embeds: [embed],
            components: [components],
        });

        TimerManager.setTimeout(async (): Promise<void> => {
            interaction.editReply({
                content: await resolveKey(interaction, "response:timeout"),
                embeds: [],
                components: [],
            });
        }, Time.Second * 60);
    }

    /* -------------------------------------------------------------------------- */

    async #generateAgreement(interaction: ImperiaCommand.ChatInputCommandInteraction) {
        const embed = new ImperiaEmbedBuilder().setTheme("info");

        embed.setTitle(await resolveKey(interaction, "register-user:agreement_title"));
        embed.setDescription(await resolveKey(interaction, "register-user:agreement_description"));

        embed.setFields([
            {
                name: await resolveKey(interaction, "register-user:field_one_title"),
                value: await resolveKey(interaction, "register-user:field_one_description"),
            },
        ]);

        embed.setFooter({
            text: await resolveKey(interaction, "register-user:agreement_footer"),
        });

        const components: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();

        components.addComponents(
            new ButtonBuilder()
                .setCustomId(`register-${interaction.user.id}-${UserAgreementStatus.CONFIRMED}`)
                .setLabel(await resolveKey(interaction, "register-user:agreement_agree"))
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`register-${interaction.user.id}-${UserAgreementStatus.DECLINED}`)
                .setLabel(await resolveKey(interaction, "register-user:agreement_decline"))
                .setStyle(ButtonStyle.Danger),
        );

        return { embed, components };
    }
}
