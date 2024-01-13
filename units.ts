class BaseDimension {
  constructor(public readonly name: string) {}
  toString() {
    return this.name;
  }
}

type Dimension = Map<number, BaseDimension>;

type One = 1;
type Two = 2;

type Length<T extends any[]> = T extends { length: infer L } ? L : never;

type BuildTuple<L extends number, T extends any[] = []> = T extends {
  length: L;
}
  ? T
  : BuildTuple<L, [...T, any]>;

type Add<A extends number, B extends number> = Length<
  [...BuildTuple<A>, ...BuildTuple<B>]
>;

type Subtract<A extends number, B extends number> =
  BuildTuple<A> extends [...infer U, ...BuildTuple<B>] ? Length<U> : never;

type Three = Add<One, Two>;

class Unit {
  constructor(
    public readonly dimension: Dimension,
    public readonly factorSiBase: number
  ) {}
}

class Quantity {
  constructor(
    public readonly value: number,
    public readonly unit: Unit
  ) {}
}
