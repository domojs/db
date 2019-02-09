import * as akala from '@akala/server';
import { EventEmitter } from 'events';
import * as shared from './shared'

akala.injectWithName(['$isModule', '$master', '$worker'], function (isModule: akala.worker.IsModule, master: akala.worker.MasterRegistration, worker: EventEmitter)
{
    if (isModule('@akala-modules/db'))
    {
        worker.on('ready', function ()
        {
            // Called when all modules have been initialized
        });
        master(__filename, './shared');
    }
    else
        exports = shared;
})();