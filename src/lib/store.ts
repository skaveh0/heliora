export interface Store<T> {
  get(): T;
  set(next: T): void;
  subscribe(listener: (state: T) => void): void;
}

/** One state value and its listeners. Every `set` notifies, so it also serves as a re-render. */
export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<(state: T) => void>();
  return {
    get: () => state,
    set(next) {
      state = next;
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
    },
  };
}
