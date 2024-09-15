import { Plugin, SapphireClient, postLogin, preInitialization } from "@sapphire/framework";
import { Services } from "./services/services";

function exposeStorePieces<T>(store: Map<string, T>, exposePiece: (name: string, piece: T) => void): void {
    for (const [name, piece] of store.entries()) {
        exposePiece(name, piece);
    }
}

export class Stores extends Plugin {
    public static [preInitialization](this: SapphireClient): void {
        this.services = new Services();
        this.stores.register(this.services.store);
    }

    public static [postLogin](this: SapphireClient): void {
        exposeStorePieces(this.services.store, this.services.exposePiece.bind(this.services));
    }
}

SapphireClient.plugins.registerPostInitializationHook(Stores[preInitialization], "Stores-PreInitialization");
SapphireClient.plugins.registerPostLoginHook(Stores[postLogin], "Stores-PostLogin");
