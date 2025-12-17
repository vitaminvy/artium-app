// Bridge for triggering the Post a Moment sheet without cross-domain coupling.
// Navigation can call requestPostMomentSheet(); Feed registers via subscribePostMomentOpen().

type Listener = () => void;

const listeners = new Set<Listener>();
let pendingOpen = false;

export const subscribePostMomentOpen = (listener: Listener) => {
  listeners.add(listener);
  if (pendingOpen) {
    pendingOpen = false;
    listener();
  }
  return () => {
    listeners.delete(listener);
  };
};

export const requestPostMomentSheet = () => {
  const handled = listeners.size > 0;
  listeners.forEach((listener) => listener());
  pendingOpen = !handled;
};
