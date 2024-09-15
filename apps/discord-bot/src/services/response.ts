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
            return "This command is globally disabled! Please try again later...";
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionCooldown) {
            return "This command is on cooldown! Please wait for the cooldown to expire...";
        }

        if (error.identifier === ImperiaIdentifiers.PreconditionRunIn) {
            return `This command is not available in this context! Please use this command in a ${getChannelType(error)}`;
        }

        /* ------------------------ PERMISSION PRECONDITIONS ------------------------ */

        if (
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionClientPermissionsNoPermissions
        ) {
            return `I am missing required permissions to execute this command!\nRequired permission(s): ${getMissingPermissions(error)}`;
        }

        if (
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissions ||
            error.identifier === ImperiaIdentifiers.PreconditionUserPermissionsNoPermissions
        ) {
            return `You are missing required permissions to execute this command!\nRequired permission(s): ${getMissingPermissions(error)}`;
        }

        /* --------------------------------- DEFAULT -------------------------------- */

        this.container.logger.debug(error.message);

        return "Unhandled error occurred while executing this command! Please contact a developer...";
    }
}
