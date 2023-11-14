import {jest} from '@jest/globals';

import memorize, {memorize as theSameMemorize} from '../library/index.js';

describe('exports', () => {
  it('should export default', () => {
    expect(memorize).toEqual(theSameMemorize);
  });
});

describe('getters and methods', () => {
  it('should handle getters', () => {
    const spy = jest.fn(() => 123);

    class Foo {
      @memorize()
      get property(): number {
        return spy();
      }
    }

    const foo = new Foo();

    expect(spy).not.toHaveBeenCalled;

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle static getters', () => {
    const spy = jest.fn(() => 123);

    class Foo {
      @memorize()
      static get property(): number {
        return spy();
      }
    }

    expect(spy).not.toHaveBeenCalled;

    expect(Foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(Foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle methods', () => {
    const spy = jest.fn(() => 123);

    class Foo {
      @memorize()
      method(): number {
        return spy();
      }
    }

    const foo = new Foo();

    expect(spy).not.toHaveBeenCalled;

    expect(foo.method()).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(foo.method()).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle static methods', () => {
    const spy = jest.fn(() => 123);

    class Foo {
      @memorize()
      static method(): number {
        return spy();
      }
    }

    expect(spy).not.toHaveBeenCalled;

    expect(Foo.method()).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(Foo.method()).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle ttl', async () => {
    const spy = jest.fn(() => 123);

    class Foo {
      @memorize({ttl: 0})
      get property(): number {
        return spy();
      }
    }

    const foo = new Foo();

    expect(spy).not.toHaveBeenCalled;

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    await new Promise<void>(resolve => setTimeout(resolve, 10));

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should handle ttl being false', async () => {
    const spy = jest.fn(() => 123);

    class Foo {
      @memorize({ttl: false})
      get property(): number {
        return spy();
      }
    }

    const foo = new Foo();

    expect(spy).not.toHaveBeenCalled;

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);

    await new Promise<void>(resolve => setTimeout(resolve, 0));

    expect(foo.property).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should handle ttl being "async"', async () => {
    const values = [123, 456, 789];
    let unstable = true;

    class Foo {
      @memorize({ttl: 'async'})
      async getValue(): Promise<number> {
        await new Promise<void>(resolve => setTimeout(resolve, 10));
        return values.shift()!;
      }

      @memorize({ttl: 'async'})
      async getUnstableValue(): Promise<number> {
        await new Promise<void>((resolve, reject) => {
          if (unstable) {
            reject();
          } else {
            setTimeout(resolve, 10);
          }
        });

        return values.shift()!;
      }
    }

    const foo = new Foo();

    const [a, b] = await Promise.all([foo.getValue(), foo.getValue()]);

    expect(a).toEqual(123);
    expect(b).toEqual(123);

    const c = await foo.getValue();

    expect(c).toEqual(456);

    let e = 0;
    let f = 0;

    try {
      await Promise.all([foo.getUnstableValue(), foo.getUnstableValue()]);
    } catch (err) {
      unstable = false;
      [e, f] = await Promise.all([
        foo.getUnstableValue(),
        foo.getUnstableValue(),
      ]);
    }

    expect(e).toEqual(789);
    expect(f).toEqual(789);
  });
});

describe('functions', () => {
  it('should handle functions', () => {
    const spy = jest.fn(() => 123);

    const fn = memorize(function test() {
      return spy();
    });

    expect(spy).not.toHaveBeenCalled;

    expect(fn()).toEqual(123);
    expect((fn as any).name).toEqual('test');
    expect(spy).toHaveBeenCalledTimes(1);

    expect(fn()).toEqual(123);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
