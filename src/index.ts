/*
  Memorize Decorator v0.2
  https://github.com/vilic/memorize-decorator
*/

import asap = require('asap');
import MultikeyMap from 'multikey-map';

export interface MemorizeOptions {
  /** Time to live:
   * 
   *  [number]: Delete cache after N milliseconds.
   * 
   *  false: Use `asap` package to schedule cache deletion.
   * 
   *  'async': Keep cache until returned Promise gets fulfilled.
   */
  ttl?: number | false | 'async';
  /** Delete cache after N calls. Ignored if `ttl` is `false` */
  atMostNTimes?: number;
}

function decorateFunction<T extends Function>(
  fn: T,
  options: MemorizeOptions | undefined,
): T {
  return (buildIntermediateFunction(fn, options) as Function) as T;
}

export function memorize<T extends Function>(
  fn: T,
  options?: MemorizeOptions,
): T;
export function memorize(options?: MemorizeOptions): MethodDecorator;
export function memorize(
  fn?: Function | MemorizeOptions,
  options?: MemorizeOptions,
): any {
  if (typeof fn === 'function') {
    return decorateFunction(fn, options);
  } else {
    options = fn;
  }

  return (
    _target: object,
    _name: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    let getter = descriptor.get;
    let value = descriptor.value;

    let fn: Function;
    let descriptorItemName: string;

    if (getter) {
      fn = getter;
      descriptorItemName = 'get';
    } else if (typeof value === 'function') {
      fn = value;
      descriptorItemName = 'value';
    } else {
      throw new TypeError('Invalid decoration');
    }

    return {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      [descriptorItemName]: buildIntermediateFunction(fn, options),
    };
  };
}

/* This one is for Typescript type inference.
 * For memorize, the first type is Function | MemorizeOptions,
 * Typescript can not hint you any parameters of MemorizeOptions.
 */
export function memorizeDecorator(options?: MemorizeOptions): MethodDecorator {
  return memorize(options);
};
export default memorize;

function buildIntermediateFunction(
  originalFn: Function,
  {ttl = Infinity, atMostNTimes = Infinity}: MemorizeOptions = {},
) {
  let cacheMap = new MultikeyMap<any[], any>();
  let countMap = new MultikeyMap<any[], number>();

  let name = originalFn.name;
  let nameDescriptor = Object.getOwnPropertyDescriptor(fn, 'name')!;

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

      if (ttl === 'async') {
        // tslint:disable-next-line:no-floating-promises
        Promise.resolve(cache).then(cleanUp, cleanUp);
        count();
      } else if (ttl === false) {
        asap(cleanUp);
      } else if (!isNaN(Number(ttl)) && ttl !== Infinity) {
        setTimeout(cleanUp, ttl);
        count();
      }
    }

    return cache;

    function cleanUp() {
      cacheMap.delete(keys);
    }
    function count() {
      const set = (x: number) => countMap.set(keys, x);
      const value = countMap.get(keys);
      if (typeof value === 'number') {
        if (value === atMostNTimes) { cleanUp(); set(0); }
        else { set(value + 1); }
      } else {
        set(1);
      }
    }
  }
}
