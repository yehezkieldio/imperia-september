import { Result } from "@sapphire/framework";

const languageMap = new Map([
    ["en-US", "American English"],
    ["id-ID", "Indonesian"],
]);

export function resolveLanguageCode(languageCode: string): Result<string, string> {
    const language: string | undefined = languageMap.get(languageCode);

    if (!language) {
        return Result.ok([...languageMap.keys()].join(", "));
    }

    return Result.ok(language);
}
