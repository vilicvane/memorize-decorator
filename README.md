[![NPM Package](https://badge.fury.io/js/memorize-decorator.svg)](https://www.npmjs.com/package/memorize-decorator)
[![Build Status](https://travis-ci.org/vilic/memorize-decorator.svg)](https://travis-ci.org/vilic/memorize-decorator)

# Memorize Decorator

A simple decorator for memorizing properties (getters) and methods. It can also wrap normal functions via the old-fashioned way.

Currently it supports none options, and **ignores arguments**.

Transpilers supported:

- **TypeScript** with `experimentalDecorators` option enabled.
- **Babel** with [transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) for version 6.x.

## Install

```sh
npm install memorize-decorator --save
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
