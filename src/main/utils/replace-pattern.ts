export function replacePattern(pattern: string, key: string, value: string): string {
    return pattern.replace(new RegExp(`{{${key}}}`, "g"), value);
}

export function replaceAllPattern(pattern: string, replacements: { [key: string]: string }): string {
    let currentPattern = pattern;
    for (const key of Object.keys(replacements)) {
        currentPattern = replacePattern(currentPattern, key, replacements[key]);
    }
    return currentPattern;
}