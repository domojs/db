import { InsertCommand as Insert } from "./insert-command";
import { UpdateCommand as Update } from "./update-command";
import { DeleteCommand as Delete } from "./delete-command";
export { Insert, Update, Delete }

export type Commands<T> = Insert<T> | Update<T> | Delete<T>;

export interface CommandResult
{
    recordsAffected: number;
}