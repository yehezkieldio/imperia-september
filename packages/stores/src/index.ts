import type { ServicesStore } from "./services/service-store";
import type { Services } from "./services/services";

import type { Utilities } from "./utilities/utilities";
import type { UtilitiesStore } from "./utilities/utilities-store";

export * from "./services/service";
export * from "./services/service-store";
export * from "./services/services";

export * from "./utilities/utility";
export * from "./utilities/utilities-store";
export * from "./utilities/utilities";

declare module "discord.js" {
    export interface Client {
        services: Services;
        utilities: Utilities;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        services: ServicesStore;
        utilities: UtilitiesStore;
    }

    interface Container {
        services: Services;
        utilities: Utilities;
    }
}
