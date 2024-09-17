import { Service } from "@imperia/stores";
import { ArgumentError, UserError } from "@sapphire/framework";

import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class ResponseService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "response",
        });
    }

    public async commandError(guildId: string, error: Error): Promise<string> {
        const resolveKey = await this.container.utilities.bot.getResolveKey(guildId);

        if (error instanceof UserError) {
            if (error.identifier === ImperiaIdentifiers.ArgsMissing) {
                return error.message;
            }

            if (error.identifier === ImperiaIdentifiers.CommandServiceError) {
                return error.message;
            }

            if (error.identifier === ImperiaIdentifiers.CommandDisabled) {
                return resolveKey("response:command_disabled");
            }
        }

        if (error instanceof ArgumentError) {
            this.container.logger.debug(error.message);

            return resolveKey("response:argument_error");
        }

        /* --------------------------------- DEFAULT -------------------------------- */

        this.container.logger.debug(error.message);

        return resolveKey("response:unhandled");
    }

    public async commandDenied(guildId: string, error: UserError): Promise<string> {
        const resolveKey = await this.container.utilities.bot.getResolveKey(guildId);

        const { getChannelType, getMissingPermissions } = this.container.utilities.bot;

        /* -------------------------- GLOBAL PRECONDITIONS -------------------------- */

        if (error.identifier === ImperiaIdentifiers.UserBlacklisted) {
            return error.message;
        }

        if (error.identifier === ImperiaIdentifiers.ServerBlacklisted) {
            return error.message;
        }

        if (error.identifier === ImperiaIdentifiers.DeveloperUserOnly) {
            return resolveKey("response:developer_only");
        }

        if (error.identifier === ImperiaIdentifiers.CommandGuildDisabled) {
            return resolveKey("response:command_guild_disabled");
        }

        /* -------------------------- GENERAL PRECONDITIONS -------------------------- */

        if (error.identifier === ImperiaIdentifiers.InvalidArgumentProvided) {
            return error.message;
        }

        if (error.identifier === ImperiaIdentifiers.CommandDisabled) {
            return resolveKey("response:command_disabled");
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionCooldown) {
            return resolveKey("response:command_cooldown");
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionRunIn) {
            return resolveKey("response:command_run", { channel_type: getChannelType(error) });
        }

        /* ------------------------ PERMISSION PRECONDITIONS ------------------------ */

        if (
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions
        ) {
            return resolveKey("response:missing_client_permissions", { permissions: getMissingPermissions(error) });
        }

        if (
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions
        ) {
            return resolveKey("response:missing_user_permissions", { permissions: getMissingPermissions(error) });
        }

        /* --------------------------------- DEFAULT -------------------------------- */

        this.container.logger.debug(error.message);

        return resolveKey("response:unhandled");
    }
}
