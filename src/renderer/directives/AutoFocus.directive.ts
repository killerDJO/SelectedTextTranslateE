import { DirectiveOptions, VNodeDirective } from "vue";

import Directive from "decorators/VueDirective";

@Directive("auto-focus")
export class AutoFocus implements DirectiveOptions {
    public inserted(el: HTMLElement, binding: VNodeDirective): void {
        if (!!binding.value) {
            el.focus();
        }
    }
}