import { Service } from "@imperia/stores";
import type { UserError } from "@sapphire/framework";

import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class ResponseService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "response",
        });
    }

    public async commandDenied(guildId: string, error: UserError): Promise<string> {
        const languageCode = await this.container.utilities.guild.getLanguage(guildId);
        const resolveKey = this.container.i18n.getT(languageCode);

        const { getChannelType, getMissingPermissions } = this.container.utilities.bot;

        /* -------------------------- GLOBAL PRECONDITIONS -------------------------- */

        if (error.identifier === ImperiaIdentifiers.UserBlacklisted) {
            return error.message;
        }

        if (error.identifier === ImperiaIdentifiers.ServerBlacklisted) {
            return error.message;
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
