import { Store } from "@sapphire/pieces";
import { Service } from "./service";

export class ServicesStore extends Store<Service, "services"> {
    public constructor() {
        super(Service, { name: "services" });
    }
}
