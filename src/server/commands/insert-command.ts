import { CommandProcessor } from "./command-processor";

export class InsertCommand<T>
{
    constructor(public readonly record: T)
    {
    }

    public accept(processor: CommandProcessor)
    {
        return processor.visitInsert(this);
    }
}
