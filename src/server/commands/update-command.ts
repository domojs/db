import { CommandProcessor } from "./command-processor";
import { CommandType } from "./command";

export class UpdateCommand<T>
{
    constructor(public readonly record: T)
    {
    }

    public type: CommandType.Update = CommandType.Update;

    public accept(processor: CommandProcessor)
    {
        return processor.visitUpdate(this);
    }
}
