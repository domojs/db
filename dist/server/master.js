"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var di = require("akala-core");
var redis = require("redis");
var debug = require("debug");
var log = debug('domojs:db');
var DbClientFactory = (function () {
    function DbClientFactory(settings, config) {
        this.settings = settings;
        this.config = config;
        log(settings);
        log(config);
        this.port = settings('db.port') || config.port;
        this.host = settings('db.host') || config.host;
        if (!this.port && !this.host)
            settings('db', { port: 6379, host: 'localhost' });
        else if (!this.port)
            settings('db.port', 6379);
        else if (!this.host)
            settings('db.host', 'localhost');
    }
    DbClientFactory.prototype.build = function () {
        var db = redis.createClient(Number(this.settings('db.port')), this.settings('db.host'), {});
        var quit = db.quit.bind(db);
        var err = new Error();
        var timeOut = setTimeout(function () {
            if (!db._persistent)
                log(err['stack']);
            // quit();
        }, 60000);
        db.quit = function () {
            clearTimeout(timeOut);
            return quit.apply(null, arguments);
        };
        db.another = this.build;
        db.on('error', function (error) {
            console.log(error);
        });
        db.osort = function (key, columns, sortKey, start, count, callback) {
            if (arguments.length < 5) {
                if ($.isFunction(sortKey)) {
                    start = sortKey;
                    sortKey = null;
                }
                else if (!isNaN(sortKey)) {
                    callback = count;
                    count = start;
                    start = sortKey;
                    sortKey = null;
                }
                if ($.isFunction(start)) {
                    callback = start;
                    start = count = null;
                }
            }
            var args = [key];
            var direction = null;
            if (sortKey) {
                var lastIndexOfSpace = sortKey.lastIndexOf(' ');
                if (lastIndexOfSpace > -1) {
                    direction = sortKey.substring(lastIndexOfSpace + 1);
                    sortKey = sortKey.substring(0, lastIndexOfSpace);
                }
                args.push('BY');
                args.push(sortKey);
            }
            if (start !== null) {
                args.push('LIMIT');
                args.push(start);
                args.push(count);
            }
            for (var i in columns) {
                args.push('GET');
                if (columns[i] == 'id')
                    args.push('#');
                else if (columns[i].charAt(0) != '*')
                    args.push('*->' + columns[i]);
                else {
                    args.push(columns[i]);
                    columns[i] = columns[i].substring(columns[i].indexOf('->') + 2);
                }
            }
            if (sortKey !== null)
                args.push('ALPHA');
            if (direction !== false)
                args.push(direction);
            log(args);
            db.sort(args, function (error, replies) {
                var result = [];
                if (error)
                    return callback(error, null);
                for (var i = 0; i < replies.length;) {
                    var item = {};
                    for (var c in columns) {
                        item[columns[c]] = replies[i++];
                    }
                    result.push(item);
                }
                callback(null, result);
            });
        };
        return db;
    };
    return DbClientFactory;
}());
DbClientFactory = __decorate([
    di.factory("$db", '$settings', '$config')
], DbClientFactory);

//# sourceMappingURL=master.js.map
