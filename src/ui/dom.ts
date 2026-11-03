/** Finds a required element by id and checks its type, failing loudly if the markup has drifted. */
export function byId<T extends Element>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Expected #${id} to be a ${type.name}`);
  return element;
}

/** Leaves unchanged text alone, because rewriting it makes screen readers announce a live region again. */
export function setText(element: Element, text: string): void {
  if (element.textContent !== text) element.textContent = text;
}

export function setTextOfAll(selector: string, text: string): void {
  for (const element of document.querySelectorAll(selector)) setText(element, text);
}
