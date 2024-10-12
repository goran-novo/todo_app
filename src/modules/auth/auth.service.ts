import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { UserService } from "../users/user.service";
import { UserDTO } from "src/domain/dtos/user.dto";
import { LoginResponse, JwtPayload } from "src/jwt/types/jwt.types";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDTO | null> {
    const user = await this.userService.validateUser(email, password);
    if (user && (await user.validatePassword(password))) {
      return new UserDTO(user);
    }
    return null;
  }

  async login(user: UserDTO): Promise<LoginResponse> {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    const options: JwtSignOptions = {
      expiresIn: this.configService.get<string>("JWT_EXPIRATION_TIME") || "1h",
    };

    return {
      access_token: this.jwtService.sign(payload, options),
    };
  }

  async register(email: string, password: string): Promise<UserDTO> {
    const existingUser = await this.userService.findUserByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException("User already exists");
    }
    const newUser = await this.userService.createUser(email, password);
    return new UserDTO(newUser);
  }
}
