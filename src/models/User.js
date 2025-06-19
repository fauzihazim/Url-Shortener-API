import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
// import { nowDatetime } from "../utils/nowDatetimeUtils.js";

const prisma = new PrismaClient();
// const dateTimeNow = nowDatetime();

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

  // log() {
  //   console.log(`Email ${this.email}, created at ${this.createdAt}`);
  // }

  // async save() {
  //   // const newUser = async() => {
  //   //   return await prisma.user.create({
  //   //     data: {
  //   //         email: "this.emails",
  //   //         password: "12"
  //   //     }
  //   //   })
  //   // }
  //   // console.log("Created, ", await newUser());
  //   return await prisma.user.create({
  //     data: {
  //         email: this.email,
  //         password: "12"
  //     }
  //   })
  // }
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
      // res.locals.dateTimeNow = this.createdAt;
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
          traditionalUser: true, // Include all posts in the returned object
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

// class Car {
//   constructor(brand) {
//     this.carname = brand;
//   }
//   present() {
//     return 'I have a ' + this.carname;
//   }
// }

// class Model extends Car {
//   constructor(brand, mod) {
//     super(brand);
//     this.model = mod;
//   }
//   show() {
//     return this.present() + ', it is a ' + this.model;
//   }
// }

// let myCar = new Model("Ford", "Mustang");
// document.getElementById("demo").innerHTML = myCar.show();

// module.exports = User;