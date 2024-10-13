import { v4 as uuidv4 } from "uuid";

export class Category {
  private _id: number;

  constructor(
    public readonly uuid: string,
    public name: string,
    id?: number,
  ) {
    this._id = id || 0;
  }

  static create(name: string): Category {
    return new Category(uuidv4(), name);
  }

  get id(): number {
    return this._id;
  }
}
