import { User } from "../models/user.model";

export class UserDTO {
  id: number;
  uuid: string;
  email: string;

  constructor(user: User) {
    this.id = user.id || 0;
    this.uuid = user.uuid;
    this.email = user.email;
  }
}
