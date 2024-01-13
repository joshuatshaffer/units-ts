// A lot of this is based on an article by Ryan Dabler.
// https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f
// I have extended it to support negative integers.

type IsPositive<N extends number> = `${N}` extends `-${number}` ? false : true;

type NegateS<N> = N extends number ? Negate<N> : never;
type Negate<N extends number> =
  // `0` needs to be handled separately because it was being widened to `number`.
  N extends 0
    ? 0
    : `${N}` extends `-${infer U extends number}`
      ? U
      : `-${N}` extends `${infer U extends number}`
        ? U
        : never;

assertSuper<-1, Negate<1>>();
assertSuper<1, Negate<-1>>();
assertSuper<123, Negate<-123>>();
assertSuper<-123, Negate<123>>();
assertSuper<0, Negate<0>>();

type Length<T extends any[]> = T extends { length: infer L } ? L : never;

type BuildTuple<L extends number, T extends any[] = []> = T extends {
  length: L;
}
  ? T
  : BuildTuple<L, [...T, any]>;

type AddNat<A extends number, B extends number> = Length<
  [...BuildTuple<A>, ...BuildTuple<B>]
>;

type SubtractNat<A extends number, B extends number> =
  BuildTuple<A> extends [...infer U, ...BuildTuple<B>]
    ? Length<U>
    : BuildTuple<B> extends [...infer U, ...BuildTuple<A>]
      ? Negate<Length<U>>
      : never;

type AddS<A, B> = A extends number
  ? B extends number
    ? Add<A, B>
    : never
  : never;
export type Add<A extends number, B extends number> =
  IsPositive<A> extends true
    ? IsPositive<B> extends true
      ? AddNat<A, B>
      : SubtractNat<A, Negate<B>>
    : IsPositive<B> extends true
      ? SubtractNat<B, Negate<A>>
      : NegateS<AddNat<Negate<A>, Negate<B>>>;

export type Subtract<A extends number, B extends number> = Add<A, Negate<B>>;

// TODO: Assert that A and B are the same type instead of B extends A.
function assertSuper<A, B extends A>() {}

assertSuper<number, 1>();

//@ts-expect-error
assertSuper<1, number>();

assertSuper<0, Add<0, 0>>();
assertSuper<2, Add<1, 1>>();
assertSuper<0, Add<1, -1>>();
assertSuper<0, Add<-1, 1>>();
assertSuper<2, Add<3, -1>>();
assertSuper<-1, Add<2, -3>>();

assertSuper<2 | 3 | 0, Negate<-3 | -2 | 0>>();

assertSuper<Add<1 | 2, 1>, 2>();
assertSuper<2 | 3, AddS<1 | 2, 1>>();

type foo = IsPositive<-2 | 0>;
