import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";
import { Role, type Role as UserRole } from "./role.js";
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
    try {
      const user = await this.prisma.client.orm.public.User.create({
        email,
        name: dto.name.trim(),
        passwordHash,
        role: Role.PATRON,
      });
      return this.issueToken(user.id, user.role);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("An account with this email already exists.");
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.client.orm.public.User
      .where({ email: dto.email.trim().toLowerCase() })
      .first();
    if (
      !user ||
      Buffer.byteLength(dto.password, "utf8") > 72 ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.issueToken(user.id, user.role);
  }

  private issueToken(userId: string, role: UserRole) {
    return {
      access_token: this.jwt.sign({ sub: userId, role }),
    };
  }
}

function isUniqueViolation(error: unknown): boolean {
  let current = error;
  for (let depth = 0; depth < 4 && current instanceof Error; depth += 1) {
    if ((current as Error & { code?: string }).code === "23505") {
      return true;
    }
    current = (current as Error & { cause?: unknown }).cause;
  }
  return false;
}
