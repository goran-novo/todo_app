import { User } from "../models/user.model";

export class UserDTO {
  id: number;
  email: string;

  constructor(user: User) {
    this.id = user.id || 0;
    this.email = user.email;
  }
}
