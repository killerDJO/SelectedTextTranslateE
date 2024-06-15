import type { Directive } from 'vue';
import { reverse } from 'lodash-es';

import { CallbacksRegistry } from './callbacks-registry';

const registry = new CallbacksRegistry();
const TAB_GUARD_ATTRIBUTE = 'data-tab-guard';

export const tabGuardDirective: Directive = {
  mounted: (element: HTMLElement) => {
    element.tabIndex = 0;
    element.setAttribute(TAB_GUARD_ATTRIBUTE, 'true');
    registry.registerCallback(element, 'focus', event => handleFocus(element, event));
  },
  unmounted: (element: HTMLElement) => {
    registry.unregisterAllCallbacks(element);
  }
};

function handleFocus(guardElement: HTMLElement, event: Event): void {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }

  const parentElement = event.target.parentElement;
  if (!parentElement) {
    console.warn('Parent element is not found');
    return;
  }

  const focusableItems = Array.from(
    parentElement.querySelectorAll("[tabindex]:not([tabindex='-1'])")
  );

  if (focusableItems[0] === guardElement) {
    reverse(focusableItems);
  }

  for (const focusableItem of focusableItems) {
    if (
      focusableItem instanceof HTMLElement &&
      !isElementHidden(focusableItem) &&
      !focusableItem.hasAttribute(TAB_GUARD_ATTRIBUTE)
    ) {
      focusableItem.focus();
      return;
    }
  }
}

function isElementHidden(element: HTMLElement): boolean {
  if (getComputedStyle(element).display === 'none') {
    return true;
  }

  if (element.parentElement === null) {
    return false;
  }

  return isElementHidden(element.parentElement);
}
