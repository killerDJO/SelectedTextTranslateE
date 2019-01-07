import { DirectiveOptions } from "vue";

import Directive from "decorators/VueDirective";

@Directive("auto-focus")
export class AutoFocus implements DirectiveOptions {
    private static readonly FocusDelayMilliseconds: number = 100;
    private static readonly MaxNumberOfTries: number = 10;

    public inserted(el: HTMLElement): void {
        this.trySetFocus(el);
    }

    private trySetFocus(el: HTMLElement, iteration: number = 0): void {
        el.focus();
        if (document.activeElement !== el && iteration < AutoFocus.MaxNumberOfTries) {
            setTimeout(() => this.trySetFocus(el, iteration + 1), AutoFocus.FocusDelayMilliseconds);
        }
    }
}