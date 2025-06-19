import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
export const UserType = Object.freeze({
  OAUTH: 'OAUTH',
  TRADITIONAL: 'TRADITIONAL'
});

class User {
  constructor(email, type = UserType.TRADITIONAL, createdAt) {
    this.email = email;
    this.createdAt = createdAt;

    if (!Object.values(UserType).includes(type)) {
      throw new Error(`Invalid user type. Valid types are: ${Object.values(UserType).join(', ')}`);
    }
    this.userType = type;
  }
}

export class OauthUser extends User {
  constructor(email, type = UserType.OAUTH, isVerified, createdAt = new Date()) {
    super(email, type, createdAt);
    this.isVerified = isVerified;
  }
  async save() {
    const user = await prisma.user.create({
      data: {
        email: this.email,
        createdAt: this.createdAt,
        userType: this.userType,
      }
    });
    const oAuthUser = await prisma.oauthUser.create({
      data: {
        idUser: user.id,
        isVerified: this.isVerified
      }
    })
    return { user, oAuthUser }
  }
}

export class TraditionalUser extends User {
  constructor(email, password, createdAt, token = null, type = UserType.TRADITIONAL) {
    super(email, type, createdAt);
    this.password = password;
    this.token = token;
  }
  async save() {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      const result = await prisma.user.create({
        data: {
          email: this.email,
          createdAt: this.createdAt,
          userType: this.userType,
          traditionalUser: {
            create: { password: hashedPassword, verifiedAt: null }
          },
        },
        include: {
          traditionalUser: true,
        },
      })
      const { traditionalUser, ...user } = result;
      return { user, traditionalUser };
    } catch (error) {
      console.error(error);
      return;
    }
  }
}