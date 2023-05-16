import {useRef} from 'react';

type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

const useEventCallback = <A extends any[], R>(fn: Fn<A, R>): Fn<A, R> => {
  const ref = useRef<Fn<A, R>>(fn);
  if (ref.current !== fn) {
    ref.current = fn;
  }

  // not sure this I like assigning to a ref during the method call, but it's what other libraries do.
  // however, React recommends it for certain circumstances: https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
  // so it's probably OK.

  const immutableRef = useRef((...args: A) => {
    // perform call on version of the callback from last commited render
    return ref.current(...args);
  }).current;

  return immutableRef;

};

export default useEventCallback;
