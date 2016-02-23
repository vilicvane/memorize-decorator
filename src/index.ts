/*
    Memorize Decorator v0.1
    https://github.com/vilic/memorize-decorator
*/

function decorateFunction<T extends Function>(target: T): T {
    let hasCache = false;
    let cache: any;

    let fn: T = <any>function () {
        if (hasCache) {
            return cache;
        }

        cache = target.call(this);
        hasCache = true;

        return cache;
    };

    for (let propertyName of Object.getOwnPropertyNames(target)) {
        let descriptor = Object.getOwnPropertyDescriptor(target, propertyName);

        if (descriptor.writable) {
            (<any>fn)[propertyName] = (<any>target)[propertyName];
        } else if (descriptor.configurable) {
            Object.defineProperty(fn, propertyName, descriptor);
        }
    }

    return fn;
}

export function memorize<T extends Function>(fn: T): T;
export function memorize(): MethodDecorator;
export function memorize(fn?: Function): any {
    if (typeof fn === 'function') {
        return decorateFunction(fn);
    }

    return (target: Object, name: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
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
        }

        if (!fn) {
            throw new TypeError('Invalid decoration');
        }

        let hasCache = false;
        let cache: any;

        return {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            [descriptorItemName]() {
                if (hasCache) {
                    return cache;
                }

                cache = fn.call(this);
                hasCache = true;

                return cache;
            }
        };
    };
}

export default memorize;
