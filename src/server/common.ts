import { Token } from "path-to-regexp";

export enum StorageType
{
    RelationalDatabase = 0,
    DocumentDatabase = 1,
    KeyValuePair = 2
}

export interface Repository<TObject, TKey>
{
    findById(key: TKey): PromiseLike<TObject>;
    update(obj: TObject): PromiseLike<void>;
    deleteByKey(key: TKey): PromiseLike<void>;
    delete(obj: TObject): PromiseLike<void>;
}

export class Model
{
    constructor()
    {
    }
}