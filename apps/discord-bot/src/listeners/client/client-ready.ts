import { ImperiaEvents } from "#lib/extensions/constants/events";

import { Listener } from "@sapphire/framework";
import type { Client, ClientUser } from "discord.js";

export class ClientReadyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: ImperiaEvents.ClientReady,
        });
    }

    public async run(client: Client): Promise<void> {
        const { username, id } = client.user as ClientUser;
        this.container.logger.info(`ClientReadyListener: Successfully logged in as ${username} (${id})`);

        await Bun.sleep(3000);

        this.header();
    }

    public async header() {
        console.log(
            `
+---------------------------------------------------------------------+
|ooooo                                                  o8o           |
|'888'                                                  '"'           |
| 888  ooo. .oo.  .oo.   oo.ooooo.   .ooooo.  oooo d8b oooo   .oooo.  |
| 888  '888P"Y88bP"Y88b   888' '88b d88' '88b '888""8P '888  'P  )88b |
| 888   888   888   888   888   888 888ooo888  888      888   .oP"888 |
| 888   888   888   888   888   888 888    .o  888      888  d8(  888 |
|o888o o888o o888o o888o  888bod8P' 'Y8bod8P' d888b    o888o 'Y888""8o|
|                         888                                         |
|                        o888o                                        |
+---------------------------------------------------------------------+
            `,
        );
    }
}
