/*
  Memorize Decorator v0.2
  https://github.com/vilic/memorize-decorator
*/

import MultikeyMap from 'multikey-map';

const RESOLVED = Promise.resolve();

export interface MemorizeOptions {
  ttl?: number | false | 'async';
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

export default memorize;

function buildIntermediateFunction(
  originalFn: Function,
  {ttl = Infinity}: MemorizeOptions = {},
) {
  let cacheMap = new MultikeyMap<any[], any>();

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
      } else if (ttl !== Infinity) {
        if (ttl === false) {
          // tslint:disable-next-line:no-floating-promises
          RESOLVED.then(cleanUp);
        } else {
          setTimeout(cleanUp, ttl);
        }
      }
    }

    return cache;

    function cleanUp() {
      cacheMap.delete(keys);
    }
  }
}
