import { TypedLambdaExpression, LambdaExpression } from "./expressions/lambda-expression";
import { BinaryOperator } from "./expressions/binary-operator";
import { Expression, TypedExpression, Predicate, Expressions, Project, Project2, StrictExpressions } from "./expressions/expression";
import { ApplySymbolExpression } from "./expressions/apply-symbol-expression";
import { ConstantExpression } from "./expressions/constant-expression";
import { ModelDefinition } from "./shared";
import { ParameterExpression } from "./expressions/parameter-expression";
import { MemberExpression } from "./expressions/member-expression";
import { NewExpression } from "./expressions/new-expression";
import { BinaryExpression } from "./expressions/binary-expression";

export class Query<T> implements AsyncIterable<T>
{
    constructor(provider: IQueryableProvider, expression?: TypedExpression<T>)
    constructor(provider: IQueryableProvider, expression?: ConstantExpression<ModelDefinition<T>>)
    constructor(public readonly provider: IQueryableProvider, public readonly expression?: TypedExpression<T>)
    {
    }

    async *[Symbol.asyncIterator]()
    {
        var data = await this.provider.execute<T[]>(this.expression);
        for await (var r of data)
            yield r;
    }

    public async firstOrDefault()
    {
        var result = await this[Symbol.asyncIterator]().next();
        return result.value
    }

    public async singleOrDefault()
    {
        var result = await this[Symbol.asyncIterator]().next();
        if (!result.done)
            throw new Error('More than one item was found');
        return result.value
    }

    public where<F extends keyof T>(field: F, operator: BinaryOperator, value: T[F]): Query<T>
    public where(expression: TypedLambdaExpression<Predicate<T>>): Query<T>
    public where<F extends keyof T>(fieldOrExpression: F | TypedLambdaExpression<Predicate<T>>, operator?: BinaryOperator, value?: T[F]): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = new ParameterExpression<T>()
            return this.where(new TypedLambdaExpression<Predicate<T>>(new BinaryExpression<StrictExpressions>(new MemberExpression(parameter, fieldOrExpression), operator, new ConstantExpression(value)), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, new ApplySymbolExpression(this.expression, QuerySymbols.where, fieldOrExpression as TypedLambdaExpression<Predicate<T>>));
    }

    public orderBy<F extends keyof T>(field: F): Query<T>
    public orderBy<U>(expression: TypedLambdaExpression<Project<T, U>>): Query<T>
    public orderBy<X>(fieldOrExpression: X | TypedLambdaExpression<Project<T, X>>): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = new ParameterExpression<T>()
            return this.orderBy(new TypedLambdaExpression<Project<T, X>>(new MemberExpression(parameter, fieldOrExpression as any as keyof T), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, new ApplySymbolExpression(this.expression, QuerySymbols.orderby, fieldOrExpression as TypedLambdaExpression<Project<T, X>>));
    }

    public orderByDescending<F extends keyof T>(field: F): Query<T>
    public orderByDescending<U>(expression: TypedLambdaExpression<Project<T, U>>): Query<T>
    public orderByDescending<X>(fieldOrExpression: X | TypedLambdaExpression<Project<T, X>>): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = new ParameterExpression<T>()
            return this.orderByDescending(new TypedLambdaExpression<Project<T, X>>(new MemberExpression(parameter, fieldOrExpression as any as keyof T), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, new ApplySymbolExpression(this.expression, QuerySymbols.orderbyDesc, fieldOrExpression as TypedLambdaExpression<Project<T, X>>));
    }

    public groupBy<F extends keyof T>(field: F): Query<T>
    public groupBy<U>(expression: TypedLambdaExpression<Project<T, U>>): Query<T>
    public groupBy<X>(fieldOrExpression: X | TypedLambdaExpression<Project<T, X>>): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = new ParameterExpression<T>()
            return this.groupBy(new TypedLambdaExpression<Project<T, X>>(new MemberExpression(parameter, fieldOrExpression as any as keyof T), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, new ApplySymbolExpression(this.expression, QuerySymbols.groupby, fieldOrExpression as TypedLambdaExpression<Project<T, X>>));
    }

    public join<U, X>(other: Query<U>, fieldT: keyof T, fieldU: keyof U, selector: { first: keyof X, second: keyof X }): Query<X>
    {
        // if (typeof fieldOrExpression == 'string')
        // {
        var parameterT = new ParameterExpression<T>()
        var parameterU = new ParameterExpression<U>()
        var joinCondition = new TypedLambdaExpression<Project2<T, U, X>>(
            new BinaryExpression<Expressions>(
                new NewExpression<X>(
                    new MemberExpression<X, typeof selector.first, X[typeof selector.first]>(new MemberExpression(parameterT, fieldT), selector.first),
                    new MemberExpression<X, typeof selector.second, X[typeof selector.second]>(new MemberExpression(parameterU, fieldU), selector.second)),
                BinaryOperator.Unknown, other.expression) as any,
            [parameterT, parameterU]);
        // }
        // if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
        //     throw new Error('Invalid type of field');
        return new Query<X>(this.provider, new ApplySymbolExpression(this.expression, QuerySymbols.join, joinCondition as TypedLambdaExpression<Project<T, X>>));
    }

    public select<F extends keyof T>(field: F): ApplySymbolExpression<T, T[F]>
    public select<U>(expression: TypedLambdaExpression<Project<T, U>>): ApplySymbolExpression<T, U>
    public select<U>(fieldOrExpression: U | TypedLambdaExpression<Project<T, U>>)
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = new ParameterExpression<T>(null)
            return this.select(LambdaExpression.typed<Project<T, U>>(new MemberExpression(parameter, fieldOrExpression as any), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<U>(this.provider, new ApplySymbolExpression<T, U>(this.expression, QuerySymbols.select, fieldOrExpression as TypedLambdaExpression<Project<T, U>>));
    }

    public any(expression?: TypedLambdaExpression<Predicate<T>>): PromiseLike<boolean>
    {
        if (expression)
            return this.where(expression).any();
        return this.provider.execute<boolean>(new ApplySymbolExpression<T, T>(this.expression, QuerySymbols.any)).then(values => values[0]);
    }

    public async length(expression?: TypedLambdaExpression<Predicate<T>>): Promise<number>
    {
        if (expression)
            return this.where(expression).length();
        var values = await this.provider.execute<number>(new ApplySymbolExpression<T, T>(this.expression, QuerySymbols.count));
        return values;
    }
}

export interface IQueryable<T>
{
    readonly provider: IQueryableProvider;
    readonly expression: Expression;
}

export interface IQueryableProvider
{
    execute<TResult>(expression: Expressions): PromiseLike<TResult>;
}

export var QuerySymbols = {
    where: Symbol('where'),
    any: Symbol('any'),
    select: Symbol('select'),
    orderby: Symbol('orderby'),
    orderbyDesc: Symbol('orderbyDesc'),
    groupby: Symbol('groupby'),
    join: Symbol('join'),
    count: Symbol('count'),
}