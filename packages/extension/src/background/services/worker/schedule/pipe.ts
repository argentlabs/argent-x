type Func<A, B> = (a: A) => B

type PipeReturn<T extends Func<any, any>[]> = ReturnType<
  T extends [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...infer _Rest,
    Func<infer A, infer B>,
  ]
    ? Func<A, B>
    : never
>

/**
 * Function to pipe a series of functions together. Calls the functions in order, passing the result of the previous function to the next function.
 * @param {Function[]} fns - The functions to pipe.
 * @returns {Function} The piped function.
 */
export function pipe<T extends Func<any, any>[]>(
  ...fns: T
): Func<Parameters<T[0]>[0], PipeReturn<T>> {
  return (input: Parameters<T[0]>[0]): PipeReturn<T> => {
    return fns.reduce((acc, fn) => fn(acc), input) as PipeReturn<T>
  }
}
