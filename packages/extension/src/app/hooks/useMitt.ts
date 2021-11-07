import { Emitter, EventType } from 'mitt';
import { useState, useEffect } from 'react';

type Initilized<
  B extends boolean,
  R extends any,
  V extends boolean = true
> = B extends V ? R : R | undefined;

export const useMitt = <
  E extends Record<EventType, unknown>,
  T extends keyof E,
  I extends any,
  B extends boolean
>(
  emitter: Emitter<E>,
  event: T,
  fn: (event: Initilized<B, E[T], false>) => I,
  init?: B
): Initilized<B, I> => {
  const [value, setValue] = useState<Initilized<B, I>>(
    (init
      ? fn(undefined as Initilized<B, E[T], false>)
      : undefined) as Initilized<B, I>
  );

  useEffect(() => {
    const handler = (arg: E[T]) => {
      const evaluatedFn = fn(arg);
      setValue(evaluatedFn);
      return evaluatedFn;
    };
    emitter.on(event, handler);
    return () => {
      emitter.off(event, handler);
    };
  }, [emitter, fn, event]);

  return value;
};
