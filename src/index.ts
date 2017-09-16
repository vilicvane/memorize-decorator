/*
  Memorize Decorator v0.1
  https://github.com/vilic/memorize-decorator
*/

import MultikeyMap from 'multikey-map';

function decorateFunction<T extends Function>(target: T): T {
  let cacheMap = new MultikeyMap<any[], any>();

  return buildIntermediateFunction(target, cacheMap) as Function as T;
}

export function memorize<T extends Function>(fn: T): T;
export function memorize(): MethodDecorator;
export function memorize(fn?: Function): any {
  if (typeof fn === 'function') {
    return decorateFunction(fn);
  }

  return (target: object, name: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    let getter = descriptor.get;
    let value = descriptor.value;

    let fn: Function | undefined;
    let descriptorItemName: string;

    if (getter) {
      fn = getter;
      descriptorItemName = 'get';
    } else if (typeof value === 'function') {
      fn = value;
      descriptorItemName = 'value';
    }

    if (!fn) {
      throw new TypeError('Invalid decoration');
    }

    let cacheMap = new MultikeyMap<any[], any>();

    return {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      [descriptorItemName!]: buildIntermediateFunction(fn, cacheMap),
    };
  };
}

export default memorize;

function buildIntermediateFunction(originalFn: Function, cacheMap: MultikeyMap<any[], any>) {
  let name = originalFn.name;
  let nameDescriptor = Object.getOwnPropertyDescriptor(fn, 'name');

  if (nameDescriptor.configurable) {
    Object.defineProperty(fn, 'name', {value: name});
  } else if (nameDescriptor.writable) {
    (fn as any).name = name;
  }

  return fn;

  function fn(this: any, ...args: any[]): any {
    let keys = [this, ...args];

    let [hasCache, cache] = cacheMap.hasAndGet(keys);

    if (!hasCache) {
      cache = originalFn.apply(this, args);
      cacheMap.set(keys, cache);
    }

    return cache;
  }
}
