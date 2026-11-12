import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, Role } from "../../generated/prisma/client.js";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RegisterDto } from "./dto/register.dto.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (Buffer.byteLength(dto.password, "utf8") > 72) {
      throw new BadRequestException("Password must not exceed 72 UTF-8 bytes.");
    }

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user: { id: string; role: Role };
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          name: dto.name.trim(),
          passwordHash,
          role: Role.PATRON,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("An account with this email already exists.");
      }
      throw error;
    }

    return this.issueToken(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (
      !user ||
      Buffer.byteLength(dto.password, "utf8") > 72 ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueToken(user.id, user.role);
  }

  private issueToken(userId: string, role: Role) {
    return {
      access_token: this.jwt.sign({ sub: userId, role }),
    };
  }
}
