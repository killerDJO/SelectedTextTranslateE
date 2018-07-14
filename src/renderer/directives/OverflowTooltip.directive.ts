import Tooltip from "tooltip.js";
import Directive from "decorators/VueDirective";
import { DirectiveOptions } from "vue";

interface TooltipData {
    tooltip: Tooltip;
    mouseenterCallback(): void;
    mouseleaveCallback(): void;
}

@Directive()
export class OverflowTooltip implements DirectiveOptions {
    public bind(element: HTMLElement): void {
        this.createTooltip(element);
    }

    public unbind(element: HTMLElement): void {
        const tooltipData = this.getTooltipData(element);
        if (tooltipData !== null) {
            this.destroyTooltip(element, tooltipData);
        }
    }

    private createTooltip(element: HTMLElement) {
        const tooltip = new Tooltip(element, {
            container: element,
            title: () => element.innerText,
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

        const mouseenterCallback = () => this.showTooltip(element, tooltip);
        const mouseleaveCallback = () => this.hideTooltip(tooltip);
        element.addEventListener("mouseenter", mouseenterCallback);
        element.addEventListener("mouseleave", mouseleaveCallback);

        this.setTooltipData(element, { tooltip, mouseenterCallback, mouseleaveCallback });
    }

    private showTooltip(element: HTMLElement, tooltip: Tooltip): void {
        if (this.isOverflown(element)) {
            tooltip.show();
        }
    }

    private hideTooltip(tooltip: Tooltip): void {
        tooltip.hide();
    }

    private isOverflown(element: HTMLElement): boolean {
        return element.offsetWidth < element.scrollWidth;
    }

    private destroyTooltip(element: HTMLElement, tooltipData: TooltipData): void {
        tooltipData.tooltip.dispose();
        element.removeEventListener("mouseenter", tooltipData.mouseenterCallback);
        element.removeEventListener("mouseleave", tooltipData.mouseleaveCallback);
        this.setTooltipData(element, null);
    }

    private setTooltipData(element: HTMLElement, tooltipData: TooltipData | null): void {
        (element.dataset as any).overflowTooltip = tooltipData;
    }

    private getTooltipData(element: HTMLElement): TooltipData | null {
        return (element.dataset as any).overflowTooltip || null;
    }
}