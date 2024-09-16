import type { InteractionResponse, Message } from "discord.js";
import type { ImperiaCommand } from "#lib/extensions/command";

export type ChatMessageResponse = Message | InteractionResponse;
export type ChatMessageContext = Message | ImperiaCommand.ChatInputCommandInteraction;
