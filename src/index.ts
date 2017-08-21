/*
  Memorize Decorator v0.1
  https://github.com/vilic/memorize-decorator
*/

import MultikeyMap from 'multikey-map';

function decorateFunction<T extends Function>(target: T): T {
  let cacheMap = new MultikeyMap<any[], any>();

  for (let propertyName of Object.getOwnPropertyNames(target)) {
    let descriptor = Object.getOwnPropertyDescriptor(target, propertyName);

    if (descriptor.writable) {
      (fn as any)[propertyName] = (target as any)[propertyName];
    } else if (descriptor.configurable) {
      Object.defineProperty(fn, propertyName, descriptor);
    }
  }

  return fn as Function as T;

  function fn(this: any, ...args: any[]): any {
    let keys = [this, ...args];

    let [hasCache, cache] = cacheMap.hasAndGet(keys);

    if (!hasCache) {
      cache = target.apply(this, args);
      cacheMap.set(keys, cache);
    }

    return cache;
  }
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
      [descriptorItemName](...args: any[]) {
        let keys = [this, ...args];

        let [hasCache, cache] = cacheMap.hasAndGet(keys);

        if (!hasCache) {
          cache = fn!.apply(this, args);
          cacheMap.set(keys, cache);
        }

        return cache;
      },
    };
  };
}

export default memorize;
