// TODO: Assert that A and B are the same type instead of B extends A.
export function assertSuper<A, B extends A>() {}

assertSuper<number, 1>();

//@ts-expect-error
assertSuper<1, number>();
