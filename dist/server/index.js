"use strict";
// import 'jquery';
var di = require("akala-core");
var debug = require("debug");
var log = debug('domojs:db');
di.injectWithName(['$master'], function (master) {
    master(module.filename, './master', './master');
})();

//# sourceMappingURL=index.js.map
