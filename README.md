[![NPM version](https://img.shields.io/npm/v/memorize-decorator?color=%23cb3837&style=flat-square)](https://www.npmjs.com/package/memorize-decorator)
[![Repository package.json version](https://img.shields.io/github/package-json/v/vilicvane/memorize-decorator?color=%230969da&label=repo&style=flat-square)](./package.json)
[![MIT License](https://img.shields.io/badge/license-MIT-999999?style=flat-square)](./LICENSE)
[![Discord](https://img.shields.io/badge/chat-discord-5662f6?style=flat-square)](https://discord.gg/vanVrDwSkS)

# Memorize Decorator

A simple decorator that memorizes results of methods and getters. It can also wrap normal functions via the old-fashioned way.

**Note:** It takes `this` and arguments (for methods and functions) as keys for the memorized results.

## Install

```sh
yarn add memorize-decorator
# or
npm install memorize-decorator --save
```

> For **CommonJS** and **experimental decorator**, use version "0.2".

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
  @memorize({
    // Delete cache after 100 milliseconds.
    ttl: 100,
  })
  method() {
    return 'abc';
  }

  @memorize({
    // Keep cache until returned Promise gets fulfilled.
    ttl: 'async',
  })
  async asyncMethod() {
    return 'abc';
  }

  @memorize({
    // Use `asap` package to schedule cache deletion.
    ttl: false,
  })
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
