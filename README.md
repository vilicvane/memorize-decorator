[![NPM Package](https://badge.fury.io/js/memorize-decorator.svg)](https://www.npmjs.com/package/memorize-decorator)
[![Build Status](https://travis-ci.org/vilic/memorize-decorator.svg)](https://travis-ci.org/vilic/memorize-decorator)

# Memorize Decorator

A simple decorator that memorizes methods and getters. It can also wrap normal functions via the old-fashioned way.

**Note:** It takes `this` and arguments (for methods and functions) as keys for the memorized results.

Transpilers supported:

- **TypeScript** with `experimentalDecorators` option enabled.
- **Babel** with [transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) for version 6.x.

## Install

```sh
npm install memorize-decorator --save

# or

yarn add memorize-decorator
```

## API References

```ts
export declare function memorize<T extends Function>(fn: T): T;
export declare function memorize(): MethodDecorator;

export default memorize;
```

## Usage

```ts
import deprecated from 'memorize-decorator';

class Foo {
  @memorize()
  method() {
    return 'abc';
  }

  @memorize()
  get property() {
    return 123;
  }

  @memorize()
  static method() {
    return 'abc';
  }

  @memorize()
  static get property() {
    return 123;
  }
}
```

For functions:

```ts
import memorize from 'memorize-decorator';

let foo = memorize(function foo() {
  // ...
});
```

## License

MIT License.
