import type { Directive } from 'vue';

import { CallbacksRegistry } from './callbacks-registry';

const registry = new CallbacksRegistry();

export const overflowTooltipDirective: Directive = {
  beforeMount: (element: HTMLElement) => {
    registry.registerCallback(element, 'mouseenter', () => {
      if (isOverflown(element)) {
        element.title = element.innerText;
      }
    });
    registry.registerCallback(element, 'mouseleave', () => element.removeAttribute('title'));
  },
  unmounted: (element: HTMLElement) => {
    registry.unregisterAllCallbacks(element);
  }
};

function isOverflown(element: HTMLElement): boolean {
  return element.offsetWidth < element.scrollWidth;
}
