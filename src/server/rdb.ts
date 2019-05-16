import * as akala from '@akala/core'
import * as common from './common'
import * as sequelize from 'sequelize'

var providers: { [name: string]: sequelize.Sequelize } = {};

export interface Repository<TObject, TKey> extends common.Repository<TObject, TKey>
{
    init(configuration: any): void;
    find(sql: string): PromiseLike<TObject[]>
}

export var main = {
    query(sql: string, ...params: string[])
    {
        akala.injectWithNameAsync(['$rdbProvider'], function ()
        {

        })
    }
}


export abstract class Model<TObject, TKey extends keyof TObject | (keyof TObject)[]> extends common.Model<TObject, TKey>
{
    constructor(tableName: string, definition: common.ModelDefinition<TObject>, key: TKey)
    {
        super(tableName, definition, key);
    }

    abstract findById(key: TObject[any] | TObject[any][]): PromiseLike<TObject>;
    abstract async update(obj: TObject): Promise<void>;
    abstract async deleteByKey(key: TObject[any] | (TObject[any])[]): Promise<void>;


}