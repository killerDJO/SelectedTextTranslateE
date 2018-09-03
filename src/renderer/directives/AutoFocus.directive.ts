import { DirectiveOptions } from "vue";

import Directive from "decorators/VueDirective";

@Directive("auto-focus")
export class AutoFocus implements DirectiveOptions {
    public inserted(el: HTMLElement): void {
        el.focus();
    }
}