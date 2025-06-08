import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const UserType = Object.freeze({
  OAUTH: 'OAUTH',
  TRADITIONAL: 'TRADITIONAL'
});

class User {
  constructor(email, type = UserType.TRADITIONAL, createdAt = new Date()) {
    this.email = email;
    this.createdAt = createdAt.toISOString();

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

  log() {
    console.log(`Email ${this.email}, created at ${this.createdAt}, isVerified ${this.isVerified}`);
  }

  async save() {
    console.log("Saving OauthUser ...");
    console.log(`Email ${this.email}, created at ${this.createdAt}, User Type ${this.userType}, isVerified ${this.isVerified}`);
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