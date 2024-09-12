import { ImperiaLogger, LogLevel } from "../src/logger";

const logger = new ImperiaLogger(LogLevel.Debug);

logger.info("Hello, world!");
