import { Store } from "@sapphire/framework";

import { Utility } from "./utility";

export class UtilitiesStore extends Store<Utility, "utilities"> {
    public constructor() {
        super(Utility, { name: "utilities" });
    }
}
