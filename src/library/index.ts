import {MultikeyMap} from 'multikey-map';

const RESOLVED = Promise.resolve();

export type MemorizeOptions = {
  ttl?: number | false | 'async';
};

function decorateFunction<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: MemorizeOptions | undefined,
): T {
  return buildIntermediateFunction(fn, options) as (
    ...args: unknown[]
  ) => unknown as T;
}

export function memorize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: MemorizeOptions,
): T;
export function memorize(options?: MemorizeOptions): {
  <TMethod extends (...args: unknown[]) => unknown>(
    target: TMethod,
    context: ClassMethodDecoratorContext,
  ): TMethod;
  <TGetter extends () => unknown>(
    target: TGetter,
    context: ClassGetterDecoratorContext,
  ): TGetter;
};
export function memorize(
  ...args:
    | [MemorizeOptions?]
    | [(...args: unknown[]) => unknown, MemorizeOptions?]
): unknown {
  if (typeof args[0] === 'function') {
    return decorateFunction(args[0], args[1]);
  }

  const [options] = args;

  return (
    ...args:
      | [
          target: (...args: unknown[]) => unknown,
          context: ClassMethodDecoratorContext,
        ]
      | [target: () => unknown, context: ClassGetterDecoratorContext]
  ) => buildIntermediateFunction(args[0], options);
}

export default memorize;

function buildIntermediateFunction(
  originalFn: (...args: unknown[]) => unknown,
  {ttl = Infinity}: MemorizeOptions = {},
): (...args: unknown[]) => unknown {
  const cacheMap = new MultikeyMap<any[], any>();

  const name = originalFn.name;
  const nameDescriptor = Object.getOwnPropertyDescriptor(fn, 'name')!;

  if (nameDescriptor.configurable) {
    Object.defineProperty(fn, 'name', {value: name});
  } else if (nameDescriptor.writable) {
    (fn as any).name = name;
  }

  return fn;

  function fn(this: any, ...args: any[]): any {
    const keys = [this, ...args];

    let [hasCache, cache] = cacheMap.hasAndGet(keys);

    if (!hasCache) {
      cache = originalFn.apply(this, args);
      cacheMap.set(keys, cache);

      if (ttl === 'async') {
        Promise.resolve(cache).then(cleanUp, cleanUp);
      } else if (ttl !== Infinity) {
        if (ttl === false) {
          RESOLVED.then(cleanUp);
        } else {
          setTimeout(cleanUp, ttl);
        }
      }
    }

    return cache;

    function cleanUp(): void {
      cacheMap.delete(keys);
    }
  }
}
