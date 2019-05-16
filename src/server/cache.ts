import * as akala from '@akala/core'
import * as common from './common'
import { Repository } from './shared';

export interface Repository<TObject, TKey> extends common.Repository<TObject, TKey>
{
}

export abstract class Model<TObject, TKey> implements Repository<TObject, TKey>
{
    abstract init(configuration: any): void;
    abstract findById(key: TKey): PromiseLike<TObject>;
    abstract update(obj: TObject): PromiseLike<void>;
    abstract deleteByKey(key: TKey): PromiseLike<void>;
    abstract delete(obj: TObject): PromiseLike<void>;
}

export interface Cache
{
    get<T=any>(key: string | number): PromiseLike<T>
    store<T>(key: string | number, object: T): PromiseLike<void>
}

// @Repository.cache.Provider('vanilla')
// export class SimpleProvider extends Model<any, any>
// {
//     private injector: akala.Injector;

//     init(configuration: any): void
//     {
//         this.injector = new akala.Injector();
//     }
//     findById(key: any): PromiseLike<any>
//     {
//         return Promise.resolve(this.injector.resolve(key));
//     }
//     update(obj: any): PromiseLike<void>
//     {
//         return Promise.resolve(this.injector.resolve(key));        
//     }
//     deleteByKey(key: any): PromiseLike<void>
//     {
//         throw new Error("Method not implemented.");
//     }
//     delete(obj: any): PromiseLike<void>
//     {
//         throw new Error("Method not implemented.");
//     }


// }

class CacheProxy implements Cache
{
    constructor(private name: string)
    {
    }
    async get<T>(key)
    {
        return await akala.injectWithNameAsync(['$cacheProvider'], function (resolver)
        {
            return resolver.get(this.name + ':' + key) as T;
        })
    }
    async store<T>(key, value)
    {
        return await akala.injectWithNameAsync(['$cacheProvider'], function (resolver)
        {
            return resolver.store(this.name + ':' + key, value);
        })
    }
}

var proxies: { [key: string]: CacheProxy } = {};

export var main: { [key: string]: Cache } = new Proxy({}, {
    get: function (target, property)
    {
        if (typeof (property) == 'symbol' || typeof (property) == 'number')
            return Reflect.get(target, property);

        var proxy = proxies[property];
        if (typeof (proxy) == 'undefined')
            proxy = proxies[property] = new CacheProxy(property);

        return proxy;
    }
});