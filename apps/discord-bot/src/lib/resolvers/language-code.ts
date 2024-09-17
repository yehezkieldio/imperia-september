import { Result } from "@sapphire/framework";

export const languageMap = new Map([
    ["en-US", "American English"],
    ["id-ID", "Bahasa Indonesia"],
]);

export function mapToLanguageArray(map: Map<string, string> = languageMap): { name: string; value: string }[] {
    const result: { name: string; value: string }[] = [];
    map.forEach((name, value) => {
        result.push({ name, value });
    });
    return result;
}

export const languageCodes = Array.from(languageMap.keys()).join(", ");

export function resolveLanguageCode(languageCode: string): Result<string, string> {
    if (languageMap.has(languageCode)) {
        return Result.ok(languageCode);
    }

    return Result.err(languageCodes);
}
