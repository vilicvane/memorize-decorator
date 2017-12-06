// tslint:disable:no-unused-expression
// tslint:disable:no-implicit-dependencies

import * as Sinon from 'sinon';

import memorize, {memorize as theSameMemorize, memorizeDecorator} from '..';

describe('memorize', () => {
  context('exports', () => {
    it('should export default', () => {
      memorize.should.equal(theSameMemorize);
    });
    it('should export decorator', () => {
      memorizeDecorator.should.a('function');
    });
  });

  context('getters and methods', () => {
    it('should handle getters', () => {
      let spy = Sinon.spy(() => 123);

      class Foo {
        @memorize()
        get property(): number {
          return spy();
        }
      }

      let foo = new Foo();

      spy.called.should.be.false;

      foo.property.should.equal(123);
      spy.calledOnce.should.be.true;

      foo.property.should.equal(123);
      spy.calledOnce.should.be.true;
    });

    it('should handle static getters', () => {
      let spy = Sinon.spy(() => 123);

      class Foo {
        @memorize()
        static get property(): number {
          return spy();
        }
      }

      spy.called.should.be.false;

      Foo.property.should.equal(123);
      spy.calledOnce.should.be.true;

      Foo.property.should.equal(123);
      spy.calledOnce.should.be.true;
    });

    it('should handle methods', () => {
      let spy = Sinon.spy(() => 123);

      class Foo {
        @memorize()
        method(): number {
          return spy();
        }
      }

      let foo = new Foo();

      spy.called.should.be.false;

      foo.method().should.equal(123);
      spy.calledOnce.should.be.true;

      foo.method().should.equal(123);
      spy.calledOnce.should.be.true;
    });

    it('should handle static methods', () => {
      let spy = Sinon.spy(() => 123);

      class Foo {
        @memorize()
        static method(): number {
          return spy();
        }
      }

      spy.called.should.be.false;

      Foo.method().should.equal(123);
      spy.calledOnce.should.be.true;

      Foo.method().should.equal(123);
      spy.calledOnce.should.be.true;
    });

    it('should handle ttl', async () => {
      let spy = Sinon.spy(() => 123);

      class Foo {
        @memorize({ttl: 0})
        get property(): number {
          return spy();
        }
      }

      let foo = new Foo();

      spy.called.should.be.false;

      foo.property.should.equal(123);
      spy.calledOnce.should.be.true;

      foo.property.should.equal(123);
      spy.calledOnce.should.be.true;

      await new Promise<void>(resolve => setTimeout(resolve, 10));

      foo.property.should.equal(123);
      spy.calledTwice.should.be.true;
    });

    it('should handle ttl being false', async () => {
      let spy = Sinon.spy(() => 123);

      class Foo {
        @memorize({ttl: false})
        get property(): number {
          return spy();
        }
      }

      let foo = new Foo();

      spy.called.should.be.false;

      foo.property.should.equal(123);
      spy.calledOnce.should.be.true;

      foo.property.should.equal(123);
      spy.calledOnce.should.be.true;

      await new Promise<void>(resolve => setTimeout(resolve, 0));

      foo.property.should.equal(123);
      spy.calledTwice.should.be.true;
    });

    it('should handle ttl being "async"', async () => {
      let values = [123, 456, 789];
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

      let foo = new Foo();

      let [a, b] = await Promise.all([foo.getValue(), foo.getValue()]);

      a.should.equal(123);
      b.should.equal(123);

      let c = await foo.getValue();

      c.should.equal(456);

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

      e.should.equal(789);
      f.should.equal(789);
    });

    it('should handle atMostNTimes', async () => {
      let times = 0;
      class Foo {
        @memorizeDecorator({ttl: 'async', atMostNTimes: 2})
        async getValue(): Promise<number> {
          await new Promise<void>(resolve => setTimeout(resolve, 10));
          times++;
          return times;
        }
      }
      let foo = new Foo;
      (await foo.getValue()).should.equal(1, 'the first call');
      (await foo.getValue()).should.equal(1, 'the second call');
      (await foo.getValue()).should.equal(2, 'the third call');
      (await foo.getValue()).should.equal(2, 'the 4th call');
      (await foo.getValue()).should.equal(3, 'the 5th call');
    });
  });

  context('functions', () => {
    it('should handle functions', () => {
      let spy = Sinon.spy(() => 123);

      let fn = memorize(function test() {
        return spy();
      });

      spy.called.should.be.false;

      fn().should.equal(123);
      (fn as any).name.should.equal('test');
      spy.calledOnce.should.be.true;

      fn().should.equal(123);
      spy.calledOnce.should.be.true;
    });
  });
});
