import { blue, cyan, green, magenta, red, yellow } from "colorette";

export enum LogLevel {
    Trace = 10,
    Debug = 20,
    Info = 30,
    Warn = 40,
    Error = 50,
    Fatal = 60,
    None = 100,
}

interface ILogger {
    trace(...values: readonly unknown[]): void;
    debug(...values: readonly unknown[]): void;
    info(...values: readonly unknown[]): void;
    warn(...values: readonly unknown[]): void;
    error(...values: readonly unknown[]): void;
    fatal(...values: readonly unknown[]): void;
}

export class ImperiaLogger implements ILogger {
    private minLevel: LogLevel;

    constructor(minLevel: LogLevel = LogLevel.Trace) {
        this.minLevel = minLevel;
    }

    #has(level: LogLevel): boolean {
        return level >= this.minLevel;
    }

    trace(...values: readonly unknown[]): void {
        this.#write(LogLevel.Trace, ...values);
    }

    debug(...values: readonly unknown[]): void {
        this.#write(LogLevel.Debug, ...values);
    }

    info(...values: readonly unknown[]): void {
        this.#write(LogLevel.Info, ...values);
    }

    warn(...values: readonly unknown[]): void {
        this.#write(LogLevel.Warn, ...values);
    }

    error(...values: readonly unknown[]): void {
        this.#write(LogLevel.Error, ...values);
    }

    fatal(...values: readonly unknown[]): void {
        this.#write(LogLevel.Fatal, ...values);
    }

    #write(level: LogLevel, ...values: readonly unknown[]): void {
        if (this.#has(level)) {
            console.log(this.#colorize(level).padEnd(16), ...values);
        }
    }

    #colorize(level: LogLevel): string {
        const levelName: string = LogLevel[level].toUpperCase();

        switch (level) {
            case LogLevel.Trace:
                return cyan(levelName);
            case LogLevel.Debug:
                return blue(levelName);
            case LogLevel.Info:
                return green(levelName);
            case LogLevel.Warn:
                return yellow(levelName);
            case LogLevel.Error:
                return red(levelName);
            case LogLevel.Fatal:
                return magenta(levelName);
            default:
                return levelName;
        }
    }
}
