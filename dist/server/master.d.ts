import * as redis from 'redis';
export interface DbClient extends redis.RedisClient {
    _persistent: boolean;
    another(): DbClient;
    quit(args?: any[], callback?: redis.ResCallbackT<any>): boolean;
    on(event: string, handler: Function): any;
    osort(key: string, columns: string[], sortKey: string, start: number, count: number, callback: redis.ResCallbackT<any[]>): void;
    osort(key: string, columns: string[], sortKey: string, callback: redis.ResCallbackT<any[]>): void;
    osort(key: string, columns: string[], start: number, count: number, callback: redis.ResCallbackT<any[]>): void;
    osort(key: string, columns: string[], callback: redis.ResCallbackT<any[]>): void;
}
