import { CommandProcessor } from "./command-processor";

export class DeleteCommand<T>
{
    constructor(public readonly record: T)
    {
    }

    public accept(processor: CommandProcessor)
    {
        return processor.visitDelete(this);
    }
}
