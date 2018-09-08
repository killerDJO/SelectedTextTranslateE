export function replacePattern(pattern: string, key: string, value: string) {
    return pattern.replace(new RegExp(`{{${key}}}`, "g"), value);
}