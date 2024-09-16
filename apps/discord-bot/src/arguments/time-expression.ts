import { Argument, type Result } from "@sapphire/framework";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";
import { resolveTimeExpression } from "#lib/resolvers/time-expression";

export class TimeExpressionArgument extends Argument<number> {
    public constructor(context: Argument.LoaderContext) {
        super(context, { name: "timeExpression" });
    }

    public run(argument: string, context: Argument.Context): Argument.Result<number> {
        const seconds: Result<number, string> = resolveTimeExpression(argument);

        if (seconds.isErr()) {
            return this.error({
                context,
                parameter: argument,
                message: "Invalid date provided.",
                identifier: ImperiaIdentifiers.CommandServiceError,
            });
        }

        if (seconds.unwrap() > 604800) {
            return this.error({
                context,
                parameter: argument,
                message: "You cannot clear messages older than 7 days.",
                identifier: ImperiaIdentifiers.CommandServiceError,
            });
        }

        return this.ok(seconds.unwrap());
    }
}
