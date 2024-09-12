import { type Mock, afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { ImperiaLogger, LogLevel } from "./logger";

type ConsoleSpy = Mock<{
    (...data: unknown[]): void;
    (message?: unknown, ...optionalParams: unknown[]): void;
    (...data: unknown[]): void;
}>;

describe("ImperiaLogger", () => {
    let logger: ImperiaLogger;
    let consoleSpy: ConsoleSpy;

    beforeEach(() => {
        consoleSpy = spyOn(console, "log");
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it("should log trace messages when level is Trace", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Trace });
        logger.trace("trace message");
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("should not log trace messages when level is higher than Trace", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Debug });
        logger.trace("trace message");
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log debug messages when level is Debug", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Debug });
        logger.debug("debug message");
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("should not log debug messages when level is higher than Debug", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Info });
        logger.debug("debug message");
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log info messages when level is Info", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Info });
        logger.info("info message");
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("should not log info messages when level is higher than Info", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Warn });
        logger.info("info message");
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log warn messages when level is Warn", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Warn });
        logger.warn("warn message");
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("should not log warn messages when level is higher than Warn", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Error });
        logger.warn("warn message");
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log error messages when level is Error", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Error });
        logger.error("error message");
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("should not log error messages when level is higher than Error", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Fatal });
        logger.error("error message");
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log fatal messages when level is Fatal", () => {
        logger = new ImperiaLogger({ minLevel: LogLevel.Fatal });
        logger.fatal("fatal message");
        expect(consoleSpy).toHaveBeenCalled();
    });
});
