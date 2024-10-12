import { v4 as uuidv4 } from "uuid";

export class Category {
  private _id: number | null;

  constructor(
    public readonly uuid: string,
    public name: string,
    id?: number,
  ) {
    this._id = id || null;
  }

  static create(name: string): Category {
    return new Category(uuidv4(), name);
  }

  get id(): number | null {
    return this._id;
  }
}
