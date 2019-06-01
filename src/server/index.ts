import * as akala from '@akala/server';
import { EventEmitter } from 'events';

export * from './shared'

export * from './expressions/expression'
export * from './expressions/expression-visitor'
export * from './expressions/apply-symbol-expression'
export * from './expressions/binary-expression'
export * from './expressions/binary-operator'
export * from './expressions/call-expression'
export * from './expressions/constant-expression'
export * from './expressions/expression-type'
export * from './expressions/lambda-expression'
export * from './expressions/member-expression'
export * from './expressions/parameter-expression'
export * from './expressions/unary-expression'
export * from './expressions/unary-operator'
export * from './commands/command-processor'
export * from './commands/command'
export * from './Query'
export * from './exceptions'
export * from './string-builder'
export * from './providers/file'
export * from './providers/vanilla'

import {providers} from './shared'
import { File } from './providers/file';
import { Vanilla } from './providers/vanilla';

providers.register('file', File)
providers.register('vanilla', Vanilla)

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
})();
