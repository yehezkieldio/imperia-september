import { database, equal } from "@imperia/database";
import { users } from "@imperia/database/schema";
import { Utility } from "@imperia/stores";

type SelectUser = typeof users.$inferSelect;
export type User = Omit<SelectUser, "id">;

export class UserUtility extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "user",
        });
    }

    public async create(userId: string) {
        try {
            await database.transaction(async (tx) => {
                await tx.insert(users).values({
                    discordId: userId,
                });
            });

            return true;
        } catch (e) {
            return false;
        }
    }

    public async delete(userId: string): Promise<void> {
        await database.transaction(async (tx) => {
            await tx.delete(users).where(equal(users.discordId, userId));
        });
    }

    public async exists(userId: string): Promise<boolean> {
        const user = await database.select().from(users).where(equal(users.discordId, userId));

        return user.length > 0;
    }

    public async get(userId: string): Promise<User | null> {
        const [user] = await database.select().from(users).where(equal(users.discordId, userId));

        return user ?? null;
    }

    /* -------------------------------------------------------------------------- */
}
