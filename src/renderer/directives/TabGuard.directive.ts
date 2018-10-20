import { DirectiveOptions } from "vue";

import Directive from "decorators/VueDirective";

@Directive("tab-guard")
export class TabGuard implements DirectiveOptions {
    public bind(element: HTMLElement): void {
        element.tabIndex = 0;
        element.addEventListener("focus", this.handleFocus);
    }

    public unbind(element: HTMLElement): void {
        element.removeEventListener("focus", this.handleFocus);
    }

    private handleFocus(event: Event) {
        if (!(event.target instanceof HTMLElement)) {
            return;
        }

        const parentElement = event.target.parentElement;
        if (!parentElement) {
            console.warn("Parent element is not found");
            return;
        }

        const firstFocusableItem = parentElement.querySelector("[tabindex]:not([tabindex='-1'])");
        if (firstFocusableItem instanceof HTMLElement) {
            firstFocusableItem.focus();
        }
    }
}