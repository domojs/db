import * as akala from '@akala/core'


export var main = {
    query(sql: string, ...params: string[])
    {
        akala.injectWithNameAsync(['$rdbProvider'], function (){
            
        })
    }
} 