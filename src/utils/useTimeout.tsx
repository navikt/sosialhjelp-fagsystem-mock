import { useEffect, useRef } from "react";

function useTimeout(
  callback: () => void,
  delay: number | null,
  trigger: boolean
) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || !trigger) {
      return;
    }

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay, trigger]);
}

export default useTimeout;
