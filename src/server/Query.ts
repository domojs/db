import { TypedLambdaExpression } from "./expressions/lambda-expression";
import { BinaryOperator } from "./expressions/binary-operator";
import { Expression, TypedExpression, Predicate, Expressions, Project, Project2, StrictExpressions } from "./expressions/expression";
import { ApplySymbolExpression } from "./expressions/apply-symbol-expression";

export class Query<T>
{
    constructor(public readonly provider: IQueryableProvider, public readonly expression?: TypedExpression<T>)
    {
    }

    public where<F extends keyof T>(field: F, operator: BinaryOperator, value: T[F]): Query<T>
    public where(expression: TypedLambdaExpression<Predicate<T>>): Query<T>
    public where<F extends keyof T>(fieldOrExpression: F | TypedLambdaExpression<Predicate<T>>, operator?: BinaryOperator, value?: T[F]): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = Expression.parameter<T>()
            return this.where(Expression.lambda<Predicate<T>>(Expression.binary<StrictExpressions>(Expression.member(parameter, fieldOrExpression), operator, Expression.constant(value)), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, Expression.applySymbol(this.expression, QuerySymbols.where, fieldOrExpression as TypedLambdaExpression<Predicate<T>>));
    }

    public orderBy<F extends keyof T>(field: F): Query<T>
    public orderBy<U>(expression: TypedLambdaExpression<Project<T, U>>): Query<T>
    public orderBy<X>(fieldOrExpression: X | TypedLambdaExpression<Project<T, X>>): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = Expression.parameter<T>()
            return this.orderBy(Expression.lambda<Project<T, X>>(Expression.member(parameter, fieldOrExpression as any as keyof T), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, Expression.applySymbol(this.expression, QuerySymbols.orderby, fieldOrExpression as TypedLambdaExpression<Project<T, X>>));
    }

    public orderByDescending<F extends keyof T>(field: F): Query<T>
    public orderByDescending<U>(expression: TypedLambdaExpression<Project<T, U>>): Query<T>
    public orderByDescending<X>(fieldOrExpression: X | TypedLambdaExpression<Project<T, X>>): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = Expression.parameter<T>()
            return this.orderByDescending(Expression.lambda<Project<T, X>>(Expression.member(parameter, fieldOrExpression as any as keyof T), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, Expression.applySymbol(this.expression, QuerySymbols.orderbyDesc, fieldOrExpression as TypedLambdaExpression<Project<T, X>>));
    }

    public groupBy<F extends keyof T>(field: F): Query<T>
    public groupBy<U>(expression: TypedLambdaExpression<Project<T, U>>): Query<T>
    public groupBy<X>(fieldOrExpression: X | TypedLambdaExpression<Project<T, X>>): Query<T>
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = Expression.parameter<T>()
            return this.groupBy(Expression.lambda<Project<T, X>>(Expression.member(parameter, fieldOrExpression as any as keyof T), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<T>(this.provider, Expression.applySymbol(this.expression, QuerySymbols.groupby, fieldOrExpression as TypedLambdaExpression<Project<T, X>>));
    }

    public join<U, X>(other: Query<U>, fieldT: keyof T, fieldU: keyof U, selector: { first: keyof X, second: keyof X }): Query<X>
    {
        // if (typeof fieldOrExpression == 'string')
        // {
        var parameterT = Expression.parameter<T>()
        var parameterU = Expression.parameter<U>()
        var joinCondition = Expression.lambda<Project2<T, U, X>>(
            Expression.binary<Expressions>(
                Expression.new<X>(
                    Expression.member<X, typeof selector.first>(Expression.member(parameterT, fieldT), selector.first),
                    Expression.member<X, typeof selector.second>(Expression.member(parameterU, fieldU), selector.second)),
                BinaryOperator.Unknown, other.expression) as any,
            [parameterT, parameterU]);
        // }
        // if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
        //     throw new Error('Invalid type of field');
        return new Query<X>(this.provider, Expression.applySymbol(this.expression, QuerySymbols.join, joinCondition as TypedLambdaExpression<Project<T, X>>));
    }

    public select<F extends keyof T>(field: F): ApplySymbolExpression<T, T[F]>
    public select<U>(expression: TypedLambdaExpression<Project<T, U>>): ApplySymbolExpression<T, U>
    public select<U>(fieldOrExpression: U | TypedLambdaExpression<Project<T, U>>)
    {
        if (typeof fieldOrExpression == 'string')
        {
            var parameter = Expression.parameter<T>()
            return this.select(Expression.lambda<Project<T, U>>(Expression.member(parameter, fieldOrExpression as any), [parameter]));
        }
        if (typeof fieldOrExpression == 'symbol' || typeof fieldOrExpression == 'number')
            throw new Error('Invalid type of field');
        return new Query<U>(this.provider, Expression.applySymbol<T, U>(this.expression, QuerySymbols.select, fieldOrExpression as TypedLambdaExpression<Project<T, U>>));
    }

    public any(expression?: TypedLambdaExpression<Predicate<T>>)
    {
        if (expression)
            return this.where(expression).any();
        return this.provider.execute<boolean>(Expression.applySymbol<T>(this.expression, QuerySymbols.any));
    }
}

export interface IQueryable<T>
{
    readonly provider: IQueryableProvider;
    readonly expression: Expression;
}

export interface IQueryableProvider
{
    execute<TResult>(expression: Expressions): PromiseLike<TResult[]>;
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
