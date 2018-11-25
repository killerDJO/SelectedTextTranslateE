import { DirectiveOptions, VNodeDirective, VNode } from "vue";
import * as _ from "lodash";

import Directive from "decorators/VueDirective";
import { DirectivesBase } from "directives/DirectivesBase";

@Directive("focus-lost")
export class AutoFocus extends DirectivesBase implements DirectiveOptions {
    public bind(element: HTMLElement, binding: VNodeDirective, vNode: VNode): void {
        if (!binding.value || !_.isFunction(binding.value)) {
            throw new Error("Function value must be provided for the focus-lost binding");
        }

        const callback = binding.value.bind(vNode.context);

        this.registerCallback(element, "focusout", event => this.handleFocusOut(event as FocusEvent, callback));
        this.registerCallback(document.body, "click", event => this.handleBodyClick(event as MouseEvent, element, callback));
    }

    public unbind(element: HTMLElement): void {
        super.unbind(element);
    }

    private handleFocusOut(event: FocusEvent, callback: () => void): void {
        const element: Element | null = event.relatedTarget as Element;
        if (element === null) {
            return;
        }

        const currentTarget = event.currentTarget;
        if (currentTarget === null) {
            return;
        }

        this.triggerFocusLostIfElementOutside(element, currentTarget as HTMLElement, callback);
    }

    private handleBodyClick(event: MouseEvent, parentElement: HTMLElement, callback: () => void): void {
        const element: Element | null = event.target as Element;
        this.triggerFocusLostIfElementOutside(element, parentElement, callback);
    }

    private triggerFocusLostIfElementOutside(element: Element | null, parentElement: Element, callback: () => void) {
        let isOutside = true;
        while (element !== null) {
            if (parentElement === element) {
                isOutside = false;
                break;
            }
            element = element.parentElement;
        }

        if (isOutside) {
            callback();
        }
    }
}