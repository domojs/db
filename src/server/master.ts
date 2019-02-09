import * as di from '@akala/server';
import * as redis from 'ioredis';
var log = di.log('domojs:db');

export interface DbClient extends redis.Redis
{
    _persistent?: boolean;
    another(): DbClient;
    on(event: string, handler: Function);
    osort(key: string, columns: string[], sortKey: string, start: number, count: number): Promise<any[]>;
    osort(key: string, columns: string[], sortKey: string): Promise<any[]>;
    osort(key: string, columns: string[], start: number, count: number): Promise<any[]>;
    osort(key: string, columns: string[]): Promise<any[]>;
    oget<T>(key: string, values: (keyof T)[]): Promise<T>;
}

@di.factory("$db", '$config.@domojs/db')
class DbClientFactory implements di.IFactory<DbClient>
{
    private port: number = 6379;
    private host: string = 'localhost';

    constructor(private config: PromiseLike<any>)
    {
        log(config);
        config.then((config) =>
        {
            this.port = config.port;
            this.host = config.host;
        });
    }


    build(): DbClient
    {
        var db = <any>new redis(Number(this.port), this.host, {}) as DbClient;
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
        });
        db.oget = function <T>(key: string, fields: (keyof T)[])
        {
            return db.hmget.apply(db, (fields as string[]).splice(0, 0, key)).then(function (result)
            {
                var o: Partial<T> = {};
                di.each(fields, function (key, i)
                {
                    o[key] = result[i];
                });
                return o;
            });
        };

        db.osort = <any>function (key: string, columns: string[], sortKey: string, start: number, count: number)
        {
            if (arguments.length < 5)
            {
                if (<any>sortKey instanceof Function)
                {
                    start = <any>sortKey;
                    sortKey = null;
                }
                else if (!isNaN(<any>sortKey))
                {
                    count = start;
                    start = <any>sortKey;
                    sortKey = null;
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
            return db.sort.apply(db, args).then((replies) =>
            {
                var result = [];

                for (var i = 0; i < replies.length;)
                {
                    var item = {};
                    for (var c in columns)
                    {
                        item[columns[c]] = replies[i++];
                    }
                    result.push(item);
                }
                return result;
            });
        };

        return db;
    }
}