import * as akala from '@akala/core'
import '@akala/test'
import { Repository as Cache } from './cache';
import { main as rdb, Repository as Sql } from './rdb';
import { main as doc, Repository as NoSql } from './doc'
import "reflect-metadata";
import { FieldType, StorageFieldType, ModelDefinition, Relationship, Attribute, StorageField, StorageView, Generator } from './common';
import { Query } from './Query';

export { Cardinality } from './cardinality'
export { rdb, doc, ModelDefinition, Relationship, Attribute, StorageField, StorageView, Generator };
export { PersistenceEngine } from './PersistenceEngine'

var module = akala.module('db');

export interface Store
{
    [key:string]:Query<any>
}

export class RepositoryFactory<T extends Sql<any, any> | Cache<any, any> | NoSql<any, any>>
{
    repositories: akala.Injector;
    providers: akala.Injector;
    constructor(type: string)
    {
        this.repositories = new akala.Injector(module);
        this.providers = new akala.Injector(module);
        module.register(type, this);
    }

    create(provider: string): T
    create(provider: string, configuration: any): T
    create(provider: string, alias: string): T
    create(provider: string, configuration?: any, alias?: string): T
    {
        if (typeof configuration == 'undefined')
            return this.repositories.resolve<T>('default');
        if (typeof configuration == 'string')
            return this.repositories.resolve<T>(configuration);
        var result = this.providers.resolve<T>(provider);
        result.init(configuration);
        if (typeof alias != 'undefined')
            this.repositories.register(alias, result);
        return result;
    }

    register(provider: string, factory: () => T)
    {
        this.providers.registerFactory(provider, factory);
    }

    Provider(provider: string)
    {
        return (factory: new () => T) =>
        {
            this.register(provider, () => { return new factory() });
        }
    }
}


export var Repository = {
    cache: new RepositoryFactory('cache'),
    sql: new RepositoryFactory('sql'),
    nosql: new RepositoryFactory('nosql'),
}

export function Model(name: string, nameInStorage?: string, collection?: string)
{
    return function <TObject>(cl: (new () => TObject))
    {
        var model = new ModelDefinition<TObject>(name, nameInStorage || name, collection || null);
        Reflect.metadata('db:model', model);
        cl.prototype = model;
    }
}

export function Field(type?: FieldType | (() => FieldType))
export function Field<T>(target: any, propertyKey: string, descriptor?: TypedPropertyDescriptor<T>)
export function Field<T>(type?: FieldType | (() => FieldType), propertyKey?: string, descriptor?: TypedPropertyDescriptor<T>)
{
    if (typeof propertyKey != 'undefined')
    {
        return Field()(type, propertyKey, descriptor);
    }

    return member(false, type);
}

export function Key(type?: FieldType | (() => FieldType))
export function Key<T>(target: any, propertyKey: string, descriptor?: TypedPropertyDescriptor<T>)
export function Key<T>(type?: FieldType | (() => FieldType), propertyKey?: string, descriptor?: TypedPropertyDescriptor<T>)
{
    if (typeof propertyKey != 'undefined')
    {
        return Key()(type, propertyKey, descriptor);
    }

    return member(true, type);
}

function member(isKey: boolean, type?: FieldType | (() => FieldType))
{
    return function <T>(target: any, propertyKey: Extract<keyof T, string>, descriptor?: TypedPropertyDescriptor<T>)
    {
        var model: ModelDefinition<T> = Reflect.getMetadata('db:model', target);

        if (typeof type != 'undefined')
            if (typeof type == 'function')
                model.defineMember(propertyKey, isKey, type());
            else
                model.defineMember(propertyKey, isKey, type);
        else if (typeof descriptor != 'undefined')
        {
            var designType = Reflect.getMetadata('design:type', target, propertyKey);
            if (designType === String)
            {
                model.defineMember(propertyKey, isKey, StorageFieldType.string());
                let set = descriptor.set;
                descriptor.set = function (value: T)
                {
                    if (typeof value != 'string')
                        throw new TypeError("Invalid type.");
                    if (value.length > model.members[propertyKey].length)
                        throw new RangeError(`${model.members[propertyKey].length} is the maximum allowed length in ${propertyKey}`);
                    set(value);
                }
            }
            else if (designType === Number)
            {
                model.defineMember(propertyKey, isKey, StorageFieldType.double());
                let set = descriptor.set;
                descriptor.set = function (value: T)
                {
                    if (typeof value != 'number')
                        throw new TypeError("Invalid type.");
                    set(value);
                }
            }
            else if (designType === Boolean)
            {
                model.defineMember(propertyKey, isKey, StorageFieldType.boolean());

                let set = descriptor.set;
                descriptor.set = function (value: T)
                {
                    if (typeof value != 'boolean')
                        throw new TypeError("Invalid type.");
                    set(value);
                }
            }

        }
        else
            throw new Error('field type on ' + propertyKey + ' could not be inferred');
    }
}


export { StorageFieldType as Types, FieldType as Type, Field as ModelField } from './common'

export { Model as Cache } from './cache';
export { Model as Sql } from './rdb';
export { Model as NoSql } from './doc';