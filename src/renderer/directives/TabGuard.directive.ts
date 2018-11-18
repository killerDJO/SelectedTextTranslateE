import { DirectiveOptions } from "vue";

import Directive from "decorators/VueDirective";
import { DirectivesBase } from "directives/DirectivesBase";

@Directive("tab-guard")
export class TabGuard extends DirectivesBase implements DirectiveOptions {
    public bind(element: HTMLElement): void {
        element.tabIndex = 0;
        this.registerCallback(element, "focus", event => this.handleFocus(event));
    }

    public unbind(element: HTMLElement): void {
        super.unbind(element);
    }

    private handleFocus(event: Event): void {
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