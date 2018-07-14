export function bindMethods(instance: any, methods: string[]): void {
    methods.forEach(method => {
        const instanceMethod = instance[method];
        if (!!instanceMethod && typeof instanceMethod === "function") {
            instance[method] = instanceMethod.bind(instance);
        }
    });
}

export function toKebabCase(str: string) {
    let kebab = str.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
    if (kebab.charAt(0) === "-") {
        kebab = kebab.substring(1);
    }
    return kebab;
}