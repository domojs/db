// import 'jquery';
import * as di from 'akala-core';
import * as debug from 'debug';
var log = debug('domojs:db');

di.injectWithName(['$master'], function (master)
{
    master(module.filename, './master', './master');
})();

export * from './master';