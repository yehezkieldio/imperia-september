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
                identifier: ImperiaIdentifiers.ArgumentTimeExpressionError,
            });
        }

        return this.ok(seconds.unwrap());
    }
}
