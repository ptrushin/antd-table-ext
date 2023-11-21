import { useState, useEffect } from "react";
export function useReactRouterHistory(location, navigate) {
  const [history, setHistory] = useState();
  useEffect(() => {
    setHistory({
      location,
      push: (path, state) => navigate(path, {
        state
      })
    });
  }, [location, navigate]);
  return history;
}