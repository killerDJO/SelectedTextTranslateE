import { DirectiveOptions, VNodeDirective } from "vue";

import Directive from "decorators/VueDirective";

@Directive("tab-index")
export class AutoFocus implements DirectiveOptions {
    public bind(element: HTMLElement, binding: VNodeDirective): void {
        this.addAttributes(element, binding);
        element.addEventListener("keydown", this.handleKeyDown);
    }

    public update(element: HTMLElement, binding: VNodeDirective): void {
        this.addAttributes(element, binding);
    }

    public unbind(element: HTMLElement): void {
        element.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            if (event.target instanceof HTMLElement) {
                event.target.click();
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    private addAttributes(element: HTMLElement, binding: VNodeDirective): void {
        const tabIndex = +binding.value || 0;
        element.tabIndex = tabIndex;
        if (tabIndex === -1) {
            element.blur();
        }

        element.classList.add("focusable");
    }
}