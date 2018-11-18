import Tooltip from "tooltip.js";
import { DirectiveOptions, VNodeDirective } from "vue";

import { DirectivesBase } from "directives/DirectivesBase";

interface TooltipData {
    tooltip: Tooltip;
    binding: VNodeDirective;
}

export abstract class TooltipBase extends DirectivesBase implements DirectiveOptions {

    private readonly tooltipsMap: Map<HTMLElement, TooltipData> = new Map();

    public bind(element: HTMLElement, binding: VNodeDirective): void {
        this.createTooltip(element, binding);
    }

    public unbind(element: HTMLElement): void {
        super.unbind(element);

        const tooltipData = this.getTooltipData(element);
        if (tooltipData !== null) {
            this.destroyTooltip(element, tooltipData);
        }
    }

    public update(element: HTMLElement, binding: VNodeDirective): void {
        const tooltipData = this.getTooltipData(element);
        if (!tooltipData) {
            return;
        }
        tooltipData.binding = binding;
        this.setTooltipData(element, tooltipData);

        const content = this.getTooltipContent(element);
        if (!!content) {
            (tooltipData.tooltip as any).updateTitleContent(content);

            if (this.shouldTooltipBeVisible(element)) {
                this.showTooltip(element, tooltipData.tooltip);
            }

        } else {
            this.hideTooltip(tooltipData.tooltip);
        }
    }

    protected abstract getTooltipContent(element: HTMLElement): string | null;

    protected shouldShowTooltip(element: HTMLElement): boolean {
        return true;
    }

    protected getBinding(element: HTMLElement): VNodeDirective {
        const tooltipData = this.getTooltipData(element);
        if (!tooltipData) {
            throw Error("Tooltip data must be set");
        }
        return tooltipData.binding;
    }

    protected shouldTooltipBeVisible(element: HTMLElement): boolean {
        return false;
    }

    protected showTooltip(element: HTMLElement, tooltip: Tooltip): void {
        if (this.shouldShowTooltip(element)) {
            tooltip.show();
        }
    }

    protected hideTooltip(tooltip: Tooltip): void {
        if (tooltip._isOpen) {
            tooltip.hide();
        }
    }

    protected getTooltipData(element: HTMLElement): TooltipData | null {
        return this.tooltipsMap.get(element) || null;
    }

    private createTooltip(element: HTMLElement, binding: VNodeDirective) {
        const tooltip = new Tooltip(element, {
            container: element,
            title: () => this.getTooltipContent(element) || "",
            trigger: "manual",
            popperOptions: {
                positionFixed: true,
                modifiers: {
                    computeStyle: {
                        gpuAcceleration: false
                    }
                }
            }
        });

        this.registerCallback(element, "mouseenter", () => this.showTooltip(element, tooltip));
        this.registerCallback(element, "mouseleave", () => this.hideTooltip(tooltip));

        this.setTooltipData(element, { tooltip, binding });
    }

    private destroyTooltip(element: HTMLElement, tooltipData: TooltipData): void {
        tooltipData.tooltip.dispose();
        this.removeTooltipData(element);
    }

    private setTooltipData(element: HTMLElement, tooltipData: TooltipData): void {
        this.tooltipsMap.set(element, tooltipData);
    }

    private removeTooltipData(element: HTMLElement): void {
        this.tooltipsMap.delete(element);
    }
}