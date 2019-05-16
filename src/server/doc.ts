import * as akala from '@akala/core'
import * as common from './common'
import { Repository, ModelDefinition } from './shared';

export interface Repository<TObject, TKey> extends common.Repository<TObject, TKey>
{
    find(query: { [TKey in keyof TObject]: RegExp | TObject[TKey] | { $gte: TObject[TKey], $lte: TObject[TKey], $gt: TObject[TKey], $lt: TObject[TKey] } }): PromiseLike<TObject[]>
}

export abstract class Model<TObject, TKey extends keyof TObject | (keyof TObject)[]> extends common.Model<TObject, TKey> implements Repository<TObject, TKey extends (keyof TObject)[] ? (TObject[TKey[number]])[] : TKey extends keyof TObject ? TObject[TKey] : never>
{
    constructor(storage: string, definition: ModelDefinition<TObject>, key: TKey)
    {
        super(storage, definition, key);
    }

    abstract init(configuration: any): void;
    abstract find(query: { [TKey in keyof TObject]: RegExp | TObject[TKey] | { $gte: TObject[TKey]; $lte: TObject[TKey]; $gt: TObject[TKey]; $lt: TObject[TKey]; }; }): PromiseLike<TObject[]>;
    abstract findById(key: TObject[any] | TObject[any][]): PromiseLike<TObject>;
    abstract update(obj: TObject): PromiseLike<void>;
    abstract deleteByKey(key: TObject[any] | TObject[any][]): PromiseLike<void>;
}

export var main = {
    query(db: string, ...params: string[])
    {
        akala.injectWithNameAsync(['$docProvider'], function (provider: Repository<any, any>)
        {
        })
    }
} 