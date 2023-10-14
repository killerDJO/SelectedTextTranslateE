export function isElementOutside(element: Element | null, parentElement: Element): boolean {
  let isOutside = true;
  while (element !== null) {
    if (parentElement === element) {
      isOutside = false;
      break;
    }
    element = element.parentElement;
  }

  return isOutside;
}
