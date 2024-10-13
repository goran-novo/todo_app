import { createHash, randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const scryptAsync = promisify(scrypt);

export class User {
  private _id: number | null;

  constructor(
    public readonly uuid: string,
    public email: string,
    private passwordHash: string,
    id?: number,
  ) {
    this._id = id || null;
  }

  static async create(email: string, password: string): Promise<User> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    const passwordHash = salt + ":" + derivedKey.toString("hex");
    return new User(uuidv4(), email, passwordHash);
  }

  async validatePassword(password: string): Promise<boolean> {
    const [salt, storedHash] = this.passwordHash.split(":");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return storedHash === derivedKey.toString("hex");
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  get id(): number | null {
    return this._id;
  }
}
