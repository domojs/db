import { Expressions } from "./expressions/expression";
import { CommandResult, Commands, CommandType, Create, Update, Delete } from "./commands/command";
import { CommandProcessor } from "./commands/command-processor";

const command = Symbol('command');

type commandable<T> = T & { [command]: Commands<T> };

export class Transaction
{
    public readonly commands: Commands<any>[] = [];

    public enlist<T>(cmd: Commands<T>)
    {
        var indexOfCmd = this.commands.indexOf(cmd);
        if (indexOfCmd == -1)
            this.commands.push(cmd);
    }

    public delist<T>(cmd: Commands<T>)
    {
        var indexOfCmd = this.commands.indexOf(cmd);
        if (indexOfCmd !== -1)
            this.commands.splice(indexOfCmd, 1);
    }
}

export abstract class PersistenceEngine
{
    constructor(private processor: CommandProcessor)
    {

    }

    public abstract load<T>(expression: Expressions): PromiseLike<T[]>;

    protected dynamicProxy<T>(result: T[])
    {
        return result.map(dynamicProxy);
    }

    private transaction: Transaction;

    public serialize<T>(obj: commandable<T>)
    {
        if (!obj[command])
            Object.defineProperty(obj, command, { value: new Create(obj) });
        this.transaction.enlist(obj[command]);
    }

    public delete<T>(obj: commandable<T>)
    {
        if (!obj[command] || obj[command].type != CommandType.Delete)
        {
            if (obj[command] === null)
            {
                this.transaction.delist(obj[command]);
                obj[command] = new Delete(obj);
            }
        }
    }

    public beginTransaction(transaction?: Transaction)
    {
        if (!transaction)
            transaction = new Transaction();
        this.transaction = transaction;
    }

    public commitTransaction()
    {
        this.process(...this.transaction.commands);
    }

    public process(...commands: Commands<any>[]): PromiseLike<CommandResult[]>
    {
        return this.processor.visitCommands(commands);
    }
}

export var dynamicProxy = function <T extends Object>(target: T)
{
    var updateCommand: Update<T> = null;
    return new Proxy<T>(target, {
        set(target, property, value, receiver)
        {
            if (!updateCommand)
                updateCommand = new Update(target);
            receiver[property] = value;
            return true;
        },
        get(target, property)
        {
            if (property === command)
                return updateCommand;
            return target[property];
        }
    })
};