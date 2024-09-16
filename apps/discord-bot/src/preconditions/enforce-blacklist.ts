import { AllFlowsPrecondition, type Result, type UserError } from "@sapphire/framework";
import { i18next } from "@sapphire/plugin-i18next";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";

import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class EnforceBlacklistPrecondition extends AllFlowsPrecondition {
    public constructor(context: AllFlowsPrecondition.LoaderContext, options: AllFlowsPrecondition.Options) {
        super(context, {
            ...options,
            position: 21,
        });
    }

    public override chatInputRun(interaction: ChatInputCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.guildId, interaction.user.id);
    }

    public override contextMenuRun(interaction: ContextMenuCommandInteraction): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(interaction.guildId, interaction.user.id);
    }

    public override messageRun(message: Message): Promise<Result<unknown, UserError>> {
        return this.doBlacklistCheck(message.guildId, message.author.id);
    }

    /* -------------------------------------------------------------------------- */

    private async doBlacklistCheck(guildId: string | null, userId: string | null): Promise<Result<unknown, UserError>> {
        if (guildId === null || userId === null) return this.ok();

        const [isServerBlacklisted, isUserBlacklisted] = await Promise.all([
            this.container.services.blacklist.isServerBlacklisted(guildId),
            this.container.services.blacklist.isUserBlacklisted(userId),
        ]);

        if (isServerBlacklisted) {
            return this.error({
                identifier: ImperiaIdentifiers.ServerBlacklisted,
                message: i18next.t("response:server_blacklisted"),
            });
        }

        if (isUserBlacklisted) {
            return this.error({
                identifier: ImperiaIdentifiers.ServerBlacklisted,
                message: i18next.t("response:user_blacklisted"),
            });
        }

        return this.ok();
    }
}
