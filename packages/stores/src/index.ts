import type { ServicesStore } from "./services/service-store";
import type { Services } from "./services/services";

export * from "./services/service";
export * from "./services/service-store";
export * from "./services/services";

declare module "discord.js" {
    export interface Client {
        services: Services;
    }
}

declare module "@sapphire/pieces" {
    interface StoreRegistryEntries {
        services: ServicesStore;
    }

    interface Container {
        services: Services;
    }
}
