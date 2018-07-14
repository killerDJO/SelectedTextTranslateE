import Vue from "vue";
import { bindMethods, toKebabCase } from "decorators/decorator-utilities";

export default function Directive(name?: string) {
    return (directive: any) => {
        const instance = new directive();
        bindMethods(instance, ["bind", "unbind", "inserted", "componentUpdated", "update"]);
        Vue.directive(name || toKebabCase(directive.name), instance);
    };
}
