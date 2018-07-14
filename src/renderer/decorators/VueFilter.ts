import Vue from "vue";
import { bindMethods, toKebabCase } from "decorators/decorator-utilities";

export default function Filter(name?: string) {
    return (filter: any) => {
        const instance = new filter();
        bindMethods(instance, ["execute"]);
        Vue.filter(name || toKebabCase(filter.name), instance.execute);
    };
}
