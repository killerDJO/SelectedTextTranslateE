import type { Directive, DirectiveBinding } from 'vue';
import { isFunction } from 'lodash-es';

import { CallbacksRegistry } from './callbacks-registry';
import { isElementOutside } from './directives.utils';

const registry = new CallbacksRegistry();

export const focusLostDirective: Directive = {
  beforeMount: (element: HTMLElement, binding: DirectiveBinding) => {
    if (!binding.value || !isFunction(binding.value)) {
      throw new Error('Function value must be provided for the focus-lost binding');
    }

    const callback = binding.value;

    registry.registerCallback(element, 'focusout', event =>
      handleFocusOut(event as FocusEvent, callback)
    );
  },
  unmounted: (element: HTMLElement) => {
    registry.unregisterAllCallbacks(element);
  }
};

function handleFocusOut(event: FocusEvent, callback: () => void): void {
  const element: Element | null = event.relatedTarget as Element;
  if (element === null) {
    callback();
    return;
  }

  const currentTarget = event.currentTarget;
  if (currentTarget === null) {
    return;
  }

  if (isElementOutside(element, currentTarget as HTMLElement)) {
    callback();
  }
}
