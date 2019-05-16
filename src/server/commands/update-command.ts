import { CommandProcessor } from "./command-processor";

export class UpdateCommand<T>
{
    constructor(public readonly record: T)
    {
    }

    public accept(processor: CommandProcessor)
    {
        return processor.visitUpdate(this);
    }
}
