import * as akala from '@akala/core'
import * as common from './common'

export interface Repository<TObject, TKey> extends common.Repository<TObject, TKey>
{
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