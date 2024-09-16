import { Service } from "@imperia/stores";
import type { UserError } from "@sapphire/framework";
import { i18next } from "@sapphire/plugin-i18next";

import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

export class ResponseService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "response",
        });
    }

    public generateDeniedResponse(error: UserError): string {
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
            return i18next.t("response:command_disabled");
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionCooldown) {
            return i18next.t("response:command_cooldown");
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionRunIn) {
            return i18next.t("response:command_run", { channel_type: getChannelType(error) });
        }

        /* ------------------------ PERMISSION PRECONDITIONS ------------------------ */

        if (
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions
        ) {
            return i18next.t("response:missing_client_permissions", { permissions: getMissingPermissions(error) });
        }

        if (
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions
        ) {
            return i18next.t("response:missing_user_permissions", { permissions: getMissingPermissions(error) });
        }

        /* --------------------------------- DEFAULT -------------------------------- */

        this.container.logger.debug(error.message);

        return i18next.t("response:unhandled");
    }
}
