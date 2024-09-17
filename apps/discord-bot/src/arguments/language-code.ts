import { Argument, type Result } from "@sapphire/framework";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { resolveLanguageCode } from "#lib/resolvers/language-code";

export class LanguageArgument extends Argument<string> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "languageCode" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<string> {
        const language: Result<string, string> = resolveLanguageCode(argument);

        if (language.isErr()) {
            throw this.error({
                context,
                parameter: argument,
                message: language.unwrapErr(),
                identifier: ImperiaIdentifiers.CommandServiceError,
            });
        }

        return this.ok(language.unwrap());
    }
}
