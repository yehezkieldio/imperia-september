import { Identifiers as SapphireIdentifiers } from "@sapphire/framework";
import { SubcommandPluginIdentifiers } from "@sapphire/plugin-subcommands";

enum Identifiers {
    /* ------------------------------ PRECONDITIONS ----------------------------- */
    RegisteredUserOnly = "RegisteredUserOnly",
    DeveloperUserOnly = "DeveloperUserOnly",
    ServerBlacklisted = "ServerBlacklisted",
    UserBlacklisted = "UserBlacklisted",
    CommandGuildDisabled = "CommandGuildDisabled",

    /* ------------------------------ COMMAND ERROR ----------------------------- */
    InvalidArgumentProvided = "invalidArgumentProvided",
    CommandServiceError = "commandServiceError",

    /* ------------------------------ PIECES ERROR ------------------------------ */
    ServiceError = "serviceError",
    UtilitiesError = "utilitiesError",

    /* ------------------------------ ARGUMENT ERROR ----------------------------- */
    ArgumentTimeExpressionError = "timeExpressionError",
    ArgumentCommandError = "commandError",
}

export const ImperiaIdentifiers = {
    ...SapphireIdentifiers,
    ...SubcommandPluginIdentifiers,
    ...Identifiers,
};
