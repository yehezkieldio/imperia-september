import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";

export enum UserAgreementStatus {
    CONFIRMED = "confirmed",
    DECLINED = "declined",
}

export class UserAgreementHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: "user-agreement-handler",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    public parse(interaction: ButtonInteraction) {
        if (!interaction.customId.startsWith("register")) {
            return this.none();
        }

        const [_, userId, status] = interaction.customId.split("-");
        const currentStatus = status as UserAgreementStatus;

        if (currentStatus === UserAgreementStatus.CONFIRMED) {
            return this.some({ userId, status: UserAgreementStatus.CONFIRMED });
        }

        if (currentStatus === UserAgreementStatus.DECLINED) {
            return this.some({ userId, status: UserAgreementStatus.DECLINED });
        }

        return this.none();
    }

    public async run(interaction: ButtonInteraction, data?: InteractionHandler.ParseResult<this>) {
        if (!data) return;

        await interaction.update({
            components: [],
        });
    }
}
