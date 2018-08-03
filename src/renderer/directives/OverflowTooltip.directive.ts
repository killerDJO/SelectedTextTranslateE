import { DirectiveOptions, VNodeDirective } from "vue";

import Directive from "decorators/VueDirective";
import { TooltipBase } from "directives/TooltipBase";

@Directive("overflow-tooltip")
export class OverflowTooltip extends TooltipBase implements DirectiveOptions {

    protected getTooltipContent(element: HTMLElement): string {
        return element.innerText;
    }

    protected shouldShowTooltip(element: HTMLElement): boolean {
        return this.isOverflown(element);
    }

    private isOverflown(element: HTMLElement): boolean {
        return element.offsetWidth < element.scrollWidth;
    }
}