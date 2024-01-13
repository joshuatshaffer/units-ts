import { Add, Subtract } from "./type-int-arithmetic";
import { assertSuper } from "./type-test-utils";

type Unit = Record<PropertyKey, number>;

type SimplifyUnit<U> = {
  [K in keyof U as U[K] extends 0 ? never : K]: U[K];
} & {};

type UnitMultiply<A extends Unit, B extends Unit> = SimplifyUnit<{
  [K in keyof A | keyof B]: Add<
    K extends keyof A ? A[K] : 0,
    K extends keyof B ? B[K] : 0
  >;
}>;

assertSuper<
  { a: 1; b: 2; c: 4 },
  UnitMultiply<{ a: 1; c: 3 }, { b: 2; c: 1 }>
>();
assertSuper<
  UnitMultiply<{ a: 1; c: 3 }, { b: 2; c: 1 }>,
  { a: 1; b: 2; c: 4 }
>();

type UnitDivide<A extends Unit, B extends Unit> = SimplifyUnit<{
  [K in keyof A | keyof B]: Subtract<
    K extends keyof A ? A[K] : 0,
    K extends keyof B ? B[K] : 0
  >;
}>;

assertSuper<
  { a: 1; b: -2; c: 2 },
  UnitDivide<{ a: 1; c: 3; d: 2 }, { b: 2; c: 1; d: 2 }>
>();
assertSuper<
  UnitDivide<{ a: 1; c: 3; d: 2 }, { b: 2; c: 1; d: 2 }>,
  { a: 1; b: -2; c: 2 }
>();

function unitMultiply<A extends Unit, B extends Unit>(
  a: A,
  b: B
): UnitMultiply<A, B> {
  const result = { ...a } as Unit;

  for (const [baseUnit, exponent] of Object.entries(b)) {
    result[baseUnit] ??= 0;
    result[baseUnit] += exponent;
  }

  return result as UnitMultiply<A, B>;
}

function unitDivide<A extends Unit, B extends Unit>(
  a: A,
  b: B
): UnitDivide<A, B> {
  const result = { ...a } as Unit;

  for (const [baseUnit, exponent] of Object.entries(b)) {
    result[baseUnit] ??= 0;
    result[baseUnit] -= exponent;
  }

  return result as UnitDivide<A, B>;
}

type QuantityS<U> = U extends Unit ? Quantity<U> : never;
export class Quantity<const U extends Unit> {
  constructor(
    public readonly value: number,
    public readonly unit: U
  ) {}

  add(other: Quantity<U>): Quantity<U> {
    return new Quantity(this.value + other.value, this.unit);
  }

  subtract(other: Quantity<U>): Quantity<U> {
    return new Quantity(this.value - other.value, this.unit);
  }

  multiply<V extends Unit>(other: Quantity<V>): QuantityS<UnitMultiply<U, V>> {
    return new Quantity(
      this.value * other.value,
      unitMultiply(this.unit, other.unit) as Unit
    ) as QuantityS<UnitMultiply<U, V>>;
  }

  divide<V extends Unit>(other: Quantity<V>): QuantityS<UnitDivide<U, V>> {
    return new Quantity(
      this.value / other.value,
      unitDivide(this.unit, other.unit) as Unit
    ) as QuantityS<UnitDivide<U, V>>;
  }
}

const meter = Symbol("meter");
const second = Symbol("second");
const gram = Symbol("gram");

const q1 = new Quantity(1, { [meter]: 1, [second]: 1 });
const q2 = new Quantity(2, { [gram]: 1, [second]: 1 });
const q3 = q1.multiply(q2);
const q4 = q1.divide(q2);
