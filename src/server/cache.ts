import * as akala from '@akala/core'
import * as common from './common'

export interface Repository<TObject, TKey> extends common.Repository<TObject, TKey>
{
}

export interface Cache
{
    get<T=any>(key: string | number): PromiseLike<T>
    store<T>(key: string | number, object: T): PromiseLike<void>
}

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