import { DirectiveOptions } from "vue";

import Directive from "decorators/VueDirective";

@Directive("tab-guard")
export class TabGuard implements DirectiveOptions {
    public bind(element: HTMLElement): void {
        element.tabIndex = 0;
        element.addEventListener("focus", event => this.handleFocus(event));
    }

    public unbind(element: HTMLElement): void {
        element.removeEventListener("focus", event => this.handleFocus(event));
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

        const focusableItems = parentElement.querySelectorAll("[tabindex]:not([tabindex='-1'])");
        for (const focusableItem of focusableItems) {
            if (focusableItem instanceof HTMLElement && !this.isElementHidden(focusableItem)) {
                focusableItem.focus();
                return;
            }
        }
    }

    private isElementHidden(element: HTMLElement): boolean {
        if (getComputedStyle(element).display === "none") {
            return true;
        }

        if (element.parentElement === null) {
            return false;
        }

        return this.isElementHidden(element.parentElement);
    }
}