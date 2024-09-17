import { Service } from "@imperia/stores";

import { UserError } from "@sapphire/framework";
import type { TFunction } from "@sapphire/plugin-i18next";
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

    private async ensureUserIsNotBanned(
        resolveKey: TFunction<"translation", undefined>,
        guild: ChatMessageContext["guild"],
        targetUser: GuildMember,
    ): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (bans.has(targetUser.id)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: resolveKey("moderation:already_banned"),
            });
        }
    }

    private async ensureUserIsBanned(
        resolveKey: TFunction<"translation", undefined>,
        guild: ChatMessageContext["guild"],
        targetUser: GuildMember,
    ): Promise<void> {
        const bans = await this.fetchBans(guild);

        if (!bans.has(targetUser.id)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: resolveKey("moderation:not_banned"),
            });
        }
    }

    private async ensureUserIsValid(
        resolveKey: TFunction<"translation", undefined>,
        guild: Guild,
        userId: string,
        action: Action,
    ): Promise<void> {
        if (userId === this.container.client.id) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: resolveKey("moderation:self_action", {
                    action: action,
                }),
            });
        }

        if (userId === guild.ownerId) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: resolveKey("moderation:owner_action", {
                    action: action,
                }),
            });
        }
    }

    private async ensureRoleHierarchy(
        resolveKey: TFunction<"translation", undefined>,
        executor: GuildMember,
        targetUser: GuildMember,
        action: Omit<Action, "unban">,
    ) {
        if (targetUser.roles.highest.position >= executor.roles.highest.position) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: resolveKey("moderation:hierarchy_action", {
                    action: action,
                }),
            });
        }
    }

    /* -------------------------------------------------------------------------- */

    private async ensureActionIsValid(
        resolveKey: TFunction<"translation", undefined>,
        targetUser: GuildMember,
        action: Action,
    ): Promise<void> {
        if (action === "kick") {
            if (!targetUser.kickable) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: resolveKey("moderation:denied_action", {
                        action: action,
                    }),
                });
            }
            return;
        }

        if (action === "ban") {
            await this.ensureUserIsNotBanned(resolveKey, targetUser.guild, targetUser);
            if (!targetUser.bannable) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: resolveKey("moderation:cant_ban"),
                });
            }
            return;
        }

        if (action === "unban") {
            await this.ensureUserIsBanned(resolveKey, targetUser.guild, targetUser);
        }
    }

    private async preflightAction(
        guild: Guild,
        context: MakeOptional<ModerationActionContext, "targetUserId" | "targetUser">,
        action: Action,
    ): Promise<void> {
        if (!guild) return;

        const resolveKey = await this.container.utilities.bot.getResolveKey(guild.id);

        if (context.targetUserId && action === "unban") {
            await this.ensureUserIsValid(resolveKey, guild, context.targetUserId, "unban");
        }

        if (context.targetUser) {
            await this.ensureUserIsValid(resolveKey, guild, context.targetUser.id, action);
            await this.ensureRoleHierarchy(resolveKey, context.executor, context.targetUser, action);
            await this.ensureActionIsValid(resolveKey, context.executor, action);
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
