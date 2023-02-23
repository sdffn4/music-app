import { useEffect, useRef } from "react";

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

const useUnmount = (fn: () => void) => {
  if (process.env.NODE_ENV === "development") {
    if (typeof fn !== "function") {
      console.error(
        `useUnmount expected parameter is a function, got ${typeof fn}`
      );
    }
  }

  const fnRef = useLatest(fn);

  useEffect(
    () => () => {
      fnRef.current();
    },
    []
  );
};

export default useUnmount;
