import * as akala from '@akala/server';
var log = akala.log('domojs:db');

akala.injectWithName(['$master', '$isModule'], function (master: akala.worker.MasterRegistration, isModule:akala.worker.IsModule)
{
    if (isModule('@domojs/db'))
        master(module.filename, './master', './master');
})();

import { DbClient } from './master';
export * from './master'
export var client: DbClient = akala.resolve<DbClient>('$db');
