import * as akala from '@akala/core'
import * as common from './common'


export interface Repository<TObject, TKey> extends common.Repository<TObject, TKey>
{
    find(query: { [TKey in keyof TObject]: RegExp | TObject[TKey] | { $gte: TObject[TKey], $lte: TObject[TKey], $gt: TObject[TKey], $lt: TObject[TKey] } }): PromiseLike<TObject[]>
}

export var main = {
    query(db: string, ...params: string[])
    {
        akala.injectWithNameAsync(['$docProvider'], function (provider: Repository<any, any>)
        {

        })
    }
} 