import * as di from 'akala-core';
import * as redis from 'redis';
import * as debug from 'debug';
import { Settings } from '../../../settings';
import { EventEmitter } from 'events';
var log = debug('domojs:db');

export interface DbClient extends redis.RedisClient
{
    _persistent: boolean;
    another(): DbClient;
    quit(args?: any[], callback?: redis.ResCallbackT<any>): boolean;
    on(event: string, handler: Function);
    osort(key: string, columns: string[], sortKey: string, start: number, count: number, callback: redis.ResCallbackT<any[]>): void;
    osort(key: string, columns: string[], sortKey: string, callback: redis.ResCallbackT<any[]>): void;
    osort(key: string, columns: string[], start: number, count: number, callback: redis.ResCallbackT<any[]>): void;
    osort(key: string, columns: string[], callback: redis.ResCallbackT<any[]>): void;
}

@di.factory("$db", '$settings', '$config')
class DbClientFactory implements di.IFactory<DbClient>
{
    private port: number;
    private host: string;
    constructor(private settings: Settings, private config)
    {
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


    build(): DbClient
    {
        var db = <DbClient><any>redis.createClient(Number(this.settings('db.port')), this.settings('db.host'), {});
        var quit = db.quit.bind(db);
        var err = new Error();
        var timeOut = setTimeout(function ()
        {
            if (!db._persistent)
                log(err['stack']);
            // quit();
        }, 60000)
        db.quit = function ()
        {
            clearTimeout(timeOut);
            return quit.apply(null, arguments);
        }
        db.another = this.build;
        db.on('error', function (error)
        {
            console.log(error);
        })
        db.osort = <any>function (key: string, columns: string[], sortKey: string, start: number, count: number, callback: redis.ResCallbackT<any[]>)
        {

            if (arguments.length < 5)
            {
                if ($.isFunction(sortKey))
                {
                    start = <any>sortKey;
                    sortKey = null;
                }
                else if (!isNaN(<any>sortKey))
                {
                    callback = <any>count;
                    count = start;
                    start = <any>sortKey;
                    sortKey = null;
                }
                if ($.isFunction(start))
                {
                    callback = <any>start;
                    start = count = null;
                }
            }
            var args: any[] = [key];
            var direction = null;
            if (sortKey)
            {
                var lastIndexOfSpace = sortKey.lastIndexOf(' ');
                if (lastIndexOfSpace > -1)
                {
                    direction = sortKey.substring(lastIndexOfSpace + 1);
                    sortKey = sortKey.substring(0, lastIndexOfSpace);
                }
                args.push('BY');
                args.push(sortKey);
            }
            if (start !== null)
            {
                args.push('LIMIT');
                args.push(start);
                args.push(count);
            }
            for (var i in columns)
            {
                args.push('GET');
                if (columns[i] == 'id')
                    args.push('#');
                else if (columns[i].charAt(0) != '*')
                    args.push('*->' + columns[i]);
                else
                {
                    args.push(columns[i]);
                    columns[i] = columns[i].substring(columns[i].indexOf('->') + 2);
                }
            }
            if (sortKey !== null)
                args.push('ALPHA');
            if (direction !== false)
                args.push(direction);
            log(args);
            db.sort(args, function (error, replies)
            {
                var result = [];
                if (error)
                    return callback(error, null);

                for (var i = 0; i < replies.length;)
                {
                    var item = {};
                    for (var c in columns)
                    {
                        item[columns[c]] = replies[i++];
                    }
                    result.push(item);
                }
                callback(null, result);
            });
        };

        return db;
    }
}