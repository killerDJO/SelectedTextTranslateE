import { DirectiveOptions, VNodeDirective } from "vue";

import Directive from "decorators/VueDirective";
import { TooltipBase } from "directives/TooltipBase";

export interface TooltipBinding {
    readonly value: string;
    readonly showOnFocus: string | null;
}

@Directive("tooltip")
export class Tooltip extends TooltipBase implements DirectiveOptions {

    public bind(element: HTMLElement, binding: VNodeDirective): void {
        super.bind(element, binding);
        this.setupFocusListeners(element);
    }

    protected getTooltipContent(element: HTMLElement): string {
        return this.getTooltipBinding(element).value;
    }

    protected shouldShowTooltip(element: HTMLElement): boolean {
        return !!this.getTooltipBinding(element).value;
    }

    protected shouldTooltipBeVisible(element: HTMLElement): boolean {
        return this.getFocusState(element);
    }

    private getTooltipBinding(element: HTMLElement): TooltipBinding {
        const bindingValue = this.getBinding(element).value;

        if (typeof bindingValue === "string") {
            return { value: bindingValue, showOnFocus: null };
        }

        return bindingValue;
    }

    private setupFocusListeners(element: HTMLElement): void {
        const showOnFocusSelector = this.getTooltipBinding(element).showOnFocus;
        if (!showOnFocusSelector) {
            return;
        }

        const tooltipData = this.getTooltipData(element);
        if (!tooltipData) {
            throw Error("TooltipData is not available");
        }

        element.querySelectorAll(showOnFocusSelector).forEach(child => {
            if (child instanceof HTMLElement) {
                this.registerCallback(child, "focusin", () => {
                    this.setFocusState(element, true);
                    this.showTooltip(element, tooltipData.tooltip);
                });
                this.registerCallback(child, "focusout", () => {
                    this.setFocusState(element, false);
                    this.hideTooltip(tooltipData.tooltip);
                });
            }
        });
    }

    private setFocusState(element: HTMLElement, tooltipFocus: boolean): void {
        element.dataset.tooltipFocus = tooltipFocus.toString();
    }

    private getFocusState(element: HTMLElement): boolean {
        return element.dataset.tooltipFocus === true.toString();
    }
}