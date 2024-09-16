import { Service } from "@imperia/stores";

import { UserError } from "@sapphire/framework";
import type { Collection, Guild, GuildBan, GuildMember } from "discord.js";

import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import type { ChatMessageContext } from "#lib/typings/message";
import type { MakeOptional } from "#lib/typings/utils.d";

type Action = "kick" | "ban" | "unban";

export interface ModerationActionContext {
    executor: GuildMember;
    targetUser: GuildMember;
    targetUserId: string;
    reason: string;
    silent?: boolean;
}

export interface BanActionContext {
    deleteMessageSeconds?: number;
}

export class ModerationService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "moderation",
        });
    }

    private async fetchBans(guild: ChatMessageContext["guild"]): Promise<Collection<string, GuildBan>> {
        if (!guild) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This command can only be executed in a server.",
            });
        }

        return await guild.bans.fetch();
    }

    /* -------------------------------------------------------------------------- */

    private async ensureUserIsNotBanned(guild: ChatMessageContext["guild"], targetUser: GuildMember): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (bans.has(targetUser.id)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This user is already banned.",
            });
        }
    }

    private async ensureUserIsBanned(guild: ChatMessageContext["guild"], targetUser: GuildMember): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (!bans.has(targetUser.id)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "This user is not banned.",
            });
        }
    }

    private async ensureUserIsValid(guild: Guild, userId: string, action: Action): Promise<void> {
        if (userId === this.container.client.id) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: `I cannot ${action} myself.`,
            });
        }

        if (userId === guild.ownerId) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: `You cannot ${action} the server owner.`,
            });
        }
    }

    private async ensureRoleHierarchy(executor: GuildMember, targetUser: GuildMember, action: Omit<Action, "unban">) {
        if (targetUser.roles.highest.position >= executor.roles.highest.position) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: `You cannot ${action} a user with an equal or higher role than yours.`,
            });
        }
    }

    /* -------------------------------------------------------------------------- */

    private async ensureActionIsValid(targetUser: GuildMember, action: Action): Promise<void> {
        if (action === "kick") {
            if (!targetUser.kickable) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: `I cannot ${action} this user.`,
                });
            }
            return;
        }

        if (action === "ban") {
            await this.ensureUserIsNotBanned(targetUser.guild, targetUser);
            if (!targetUser.bannable) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: "I cannot ban this user.",
                });
            }
            return;
        }

        if (action === "unban") {
            await this.ensureUserIsBanned(targetUser.guild, targetUser);
        }
    }

    private async preflightAction(
        guild: Guild,
        context: MakeOptional<ModerationActionContext, "targetUserId" | "targetUser">,
        action: Action,
    ): Promise<void> {
        if (context.targetUserId && action === "unban") {
            await this.ensureUserIsValid(guild, context.targetUserId, "unban");
        }

        if (context.targetUser) {
            await this.ensureUserIsValid(guild, context.targetUser.id, action);
            await this.ensureRoleHierarchy(context.executor, context.targetUser, action);
            await this.ensureActionIsValid(context.executor, action);
        }
    }

    /* -------------------------------------------------------------------------- */

    public async kick(guild: Guild, context: Omit<ModerationActionContext, "targetUserId">): Promise<boolean> {
        await this.preflightAction(guild, context, "kick");

        const kick = await context.targetUser.kick(context.reason);
        if (kick) return true;

        return false;
    }

    public async ban(
        guild: Guild,
        context: Omit<ModerationActionContext & BanActionContext, "targetUserId">,
    ): Promise<boolean> {
        await this.preflightAction(guild, context, "ban");

        const ban = await context.targetUser.ban({
            reason: context.reason,
            ...(context.deleteMessageSeconds &&
                context.deleteMessageSeconds !== 0 && { deleteMessageSeconds: context.deleteMessageSeconds }),
        });
        if (ban) return true;

        return false;
    }

    public async unban(guild: Guild, context: Omit<ModerationActionContext, "targetUser">): Promise<boolean> {
        await this.preflightAction(guild, context, "unban");

        const unban = await guild.bans.remove(context.targetUserId, context.reason);
        if (unban) return true;

        return false;
    }
}
