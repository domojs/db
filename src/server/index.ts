import * as akala from '@akala/server';
var log = akala.log('domojs:db');

akala.injectWithName(['$master'], function (master: akala.worker.MasterRegistration)
{
    master(module.filename, './master', './master');
})();

export * from './master';