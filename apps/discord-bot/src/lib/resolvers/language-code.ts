import { Result } from "@sapphire/framework";

export const languageMap = new Map([
    ["en-US", "American English"],
    ["id-ID", "Indonesian"],
]);

export function mapToLanguageArray(map: Map<string, string> = languageMap): { name: string; value: string }[] {
    const result: { name: string; value: string }[] = [];
    map.forEach((name, value) => {
        result.push({ name, value });
    });
    return result;
}

export function resolveLanguageCode(languageCode: string): Result<string, string> {
    const language: string | undefined = languageMap.get(languageCode);

    if (!language) {
        return Result.ok([...languageMap.keys()].join(", "));
    }

    return Result.ok(language);
}
