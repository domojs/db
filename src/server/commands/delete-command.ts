import { CommandProcessor } from "./command-processor";
import { CommandType } from "./command";

export class DeleteCommand<T>
{
    constructor(public readonly record: T)
    {
    }

    public type: CommandType.Delete = CommandType.Delete;

    public accept(processor: CommandProcessor)
    {
        return processor.visitDelete(this);
    }
}
