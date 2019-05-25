import { CommandProcessor } from "./command-processor";
import { CommandType } from "./command";

export class CreateCommand<T>
{
    constructor(public readonly record: T)
    {
    }

    public type: CommandType.Create = CommandType.Create;

    public accept(processor: CommandProcessor)
    {
        return processor.visitInsert(this);
    }
}
