import { useState, useCallback } from "react";
let modifyState;
window.addEventListener('popstate', () => {
  if (modifyState) modifyState();
});
export function useHistory() {
  const getHistory = () => ({
    location: window.location,
    push: (path, state) => window.history.pushState(state, undefined, path)
  });
  const [history, setHistory] = useState(getHistory());
  const callback = useCallback(() => {
    setHistory(getHistory());
  }, []);
  modifyState = callback;
  return history;
}