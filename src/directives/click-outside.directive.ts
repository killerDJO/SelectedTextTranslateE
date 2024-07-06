import type { Directive, DirectiveBinding } from 'vue';

import { CallbacksRegistry } from './callbacks-registry';
import { isElementOutside } from './directives.utils';

const registry = new CallbacksRegistry();

export const clickOutsideDirective: Directive = {
  beforeMount: (element: HTMLElement, binding: DirectiveBinding) => {
    if (!binding.value || typeof binding.value !== 'function') {
      throw new Error('Function value must be provided for the click-outside binding');
    }

    const callback = binding.value;

    registry.registerCallback(
      document.body,
      'click',
      event => handleBodyClick(event as MouseEvent, element, callback),
      true
    );
  },
  unmounted: (element: HTMLElement) => {
    registry.unregisterAllCallbacks(element);
  }
};

function handleBodyClick(
  event: MouseEvent,
  parentElement: HTMLElement,
  callback: () => void
): void {
  const element: Element | null = event.target as Element;
  if (isElementOutside(element, parentElement)) {
    callback();
  }
}
