import { database, equal } from "@imperia/database";
import { blacklistEntities } from "@imperia/database/schema";
import { Service } from "@imperia/stores";
import { UserError } from "@sapphire/framework";
import { ImperiaIdentifiers } from "#lib/extensions/constants/identifiers";

type SelectBlacklistedEntities = typeof blacklistEntities.$inferSelect;
export type BlacklistEntities = Omit<SelectBlacklistedEntities, "id">;

export class BlacklistService extends Service {
    public constructor(context: Service.LoaderContext, options: Service.Options) {
        super(context, {
            ...options,
            name: "blacklist",
        });
    }

    public async getAll(): Promise<SelectBlacklistedEntities[]> {
        return await database.select().from(blacklistEntities);
    }

    public async getServers(): Promise<SelectBlacklistedEntities[]> {
        const servers: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityType, "guild"));

        if (!servers) return [];
        return servers;
    }

    public async getUsers(): Promise<SelectBlacklistedEntities[]> {
        const users: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityType, "user"));

        if (!users) return [];
        return users;
    }

    public async getById(entityId: string): Promise<SelectBlacklistedEntities | undefined> {
        const entity: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, entityId));

        if (!entity) return undefined;
        return entity[0];
    }

    public async isUserBlacklisted(userId: string): Promise<boolean> {
        const user: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, userId));

        return !!user;
    }

    public async isServerBlacklisted(guildId: string): Promise<boolean> {
        const server: SelectBlacklistedEntities[] = await database
            .select()
            .from(blacklistEntities)
            .where(equal(blacklistEntities.entityId, guildId));

        return !!server;
    }

    public async create(newEntity: BlacklistEntities): Promise<void> {
        const entity: SelectBlacklistedEntities[] = await database.insert(blacklistEntities).values(newEntity);

        if (!entity) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ServiceError,
                message: "Failed to create a blacklist entity.",
            });
        }
    }

    public async remove(entityId: string): Promise<void> {
        const entity: SelectBlacklistedEntities[] = await database
            .delete(blacklistEntities)
            .where(equal(blacklistEntities.entityId, entityId));

        if (!entity) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ServiceError,
                message: "Failed to remove a blacklist entity.",
            });
        }
    }
}
