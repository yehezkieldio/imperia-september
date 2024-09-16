import { EmbedBuilder } from "discord.js";
import { Colors } from "#lib/colors";

export class ImperiaEmbedBuilder extends EmbedBuilder {
    public constructor() {
        super();
        this.setColor(Colors.primary);
    }

    /**
     * Set the color of the embed.
     * @see {@link Colors} for available colors.
     */
    public setTheme(color: keyof typeof Colors): this {
        this.setColor(Colors[color]);
        return this;
    }
}
