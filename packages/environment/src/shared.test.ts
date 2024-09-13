import { describe, beforeEach, it, expect } from "bun:test";

describe("ImperiaEnvironment", () => {
    beforeEach(() => {
        process.env = {
            ...process.env,
            NODE_ENV: process.env.NODE_ENV ?? "test",
        };
    });

    it("should set NODE_ENV to 'test' if not defined", () => {
        require("./shared");
        expect(process.env.NODE_ENV).toBe("test");
    });

    it("should retain NODE_ENV if already defined", () => {
        require("./shared");
        process.env.NODE_ENV = "production";
        expect(process.env.NODE_ENV).toBe("production");
    });
});
