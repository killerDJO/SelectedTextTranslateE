import { DirectiveOptions, VNodeDirective } from "vue";
import * as _ from "lodash";

import Directive from "decorators/VueDirective";
import { DirectivesBase } from "directives/DirectivesBase";

@Directive("focus-lost")
export class AutoFocus extends DirectivesBase implements DirectiveOptions {
    public bind(element: HTMLElement, binding: VNodeDirective): void {
        if (!binding.value || !_.isFunction(binding.value)) {
            throw new Error("Function value must be provided for the focus-lost binding");
        }

        this.registerCallback(element, "focusout", event => this.handleFocusOut(event as FocusEvent, binding.value));
    }

    public unbind(element: HTMLElement): void {
        super.unbind(element);
    }

    private handleFocusOut(event: FocusEvent, callback: () => void): void {
        let isFocusLost = true;
        let element: Element | null = event.relatedTarget as Element;
        const currentTarget = event.currentTarget;
        if (event.currentTarget === null) {
            return;
        }

        while (element !== null) {
            if (currentTarget === element) {
                isFocusLost = false;
                break;
            }
            element = element.parentElement;
        }

        if (isFocusLost) {
            callback();
        }
    }
}