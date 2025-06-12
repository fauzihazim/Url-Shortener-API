// import express from 'express';
import { PrismaClient, Prisma } from "@prisma/client";
import {google} from 'googleapis';
import crypto from 'crypto';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { email } from "zod/v4";
// import {User} from "../interfaces/User"
import {OauthUser, TraditionalUser, UserType} from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";
import { error } from "console";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import 'dotenv/config';

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUR_CLIENT_ID,
  process.env.YOUR_CLIENT_SECRET,
  process.env.YOUR_REDIRECT_URL
);
const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];
const state = crypto.randomBytes(32).toString('hex');
const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true,
  state: state
});

export const authGoogle = (req, res) => {
    res.redirect(authorizationUrl);
}

export const googleLogin = async (req, res) => {
  try {
    const {code} = req.query;
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    })
    const {data} = await oauth2.userinfo.get();
    if (!data) {
      res.status(401).json({
        status: "failed",
        error: "failed to login with google account"
      });
    }
    console.log("Data, ", data);
    
    console.log("Email, ", data.email);
    
    const findUser = await findingUser(data.email);
    console.log("Find User. ", findUser);
    

    // const newUser = new OauthUser(data.email, "OAUTH", data.verified_email);
    
    if (!findUser) {
      const newUser = new OauthUser(
        data.email,                   // Required
        UserType.OAUTH,               // Hardcoded for OAuth users
        data.verified_email           // From request
      );
      newUser.log();
      const saveUser = await newUser.save();
      console.log("Saving user id, ", saveUser.user.id);
      res.status(201).json({  
        status: "success",
        message: "User registered successfully",
        data: {  
          accessToken: generateAccessToken({ sub: saveUser.user.id }),
          refreshToken: generateRefreshToken({ sub: saveUser.user.id })
        }
      });
      return;
    }
    // login(req, res, data.email);
    res.status(200).json({  
      status: "success",
      message: "User login successfully",
      data: {  
        accessToken: generateAccessToken({ sub: findUser.id }),
        refreshToken: generateRefreshToken({ sub: findUser.id })
      }
    });
    // return;
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Internal server error"
    });
  }
}

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const timeToTokenExpired = tokenExpired();
    console.log(`Email ${email}, password ${password}`);
    const findUser = await findingUser(email);
    console.log("Find User, ", findUser);
    
    if (findUser) {
      res.status(409).json({  
        status: "failed",
        error: "Email has been used"
      });
      return;
    }
    
    const newUser = new TraditionalUser(
      email,                   // Required
      password                 // Hardcoded for OAuth users
    );
    newUser.log();
    const saveUser = await newUser.save();
    console.log("Saving user id, ", saveUser);
    const verificationToken = generateVerificationToken();
    await sendVerificationEmail(email, verificationToken);
    console.log("Verification token: ", verificationToken);
    await saveAndDeleteOldVerificationToken(saveUser.user.id, verificationToken);
    return res.status(201).json({
      status  : "success",
      message : "User registered successfully, please check verification in your Gmail"
    });
    // return;
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Internal server error"
    });
  }
}

const findingUser = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email: email, // Replace with your unique identifier
    },
    select: {
      id: true,
      email: true,
      userType: true,
    },
  });
}



const sendVerificationEmail = async (email, verificationToken) => {
  console.log(`Send Verification to Email ${email}`);
  const verificationUrl = `http://localhost:3000/verify/${verificationToken}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "betatest4590@gmail.com",
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
  // Configure the mailoptions object
  const mailOptions = {
    from: 'beta4590@gmail.com',
    to: email,
    // subject: 'Sending Email using Node.js',
    // text: 'That was easy!'
    subject: 'Email Verification',
    html: `
      <p>Please click the following link to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error; // This will be caught by registerUser's try-catch
  }
}

const generateVerificationToken = () => {
  return nanoid(32); // 32-character URL-friendly ID
}

const tokenExpired = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);;
}

export const askNewToken = async(req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  console.log(`Ask new token ${email}, password ${password}`);
  res.send(`Ask new token ${email}, password ${password}`);
  // try {
  //   const findUser = await findingUser(data.email);
  //   if (condition) {
      
  //   }
  //   await prisma.$transaction([
  //     prisma.verificationToken.deleteMany({ where: { idUser: findUser.id } }),
  //     prisma.verificationToken.create({
  //       data: {
  //         idUser: userId,
  //         token: verificationToken,
  //         tokenExpire: tokenExpired(),
  //       }
  //     }),
  //   ]);
  //   const newVerificationToken = generateVerificationToken();
  //   console.log(newVerificationToken);
  //   return newVerificationToken
  // } catch (error) {
  //   console.error("Failed generate new verification Token: ", error);
  //   throw error; // This will be caught by registerUser's try-catch
  // }
}

const saveAndDeleteOldVerificationToken = async (userId, verificationToken) => {
  try {
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { idUser: userId } }),
      prisma.verificationToken.create({
        data: {
          idUser: userId,
          token: verificationToken,
          tokenExpire: tokenExpired(),
        }
      }),
    ]);
  } catch (error) {
    console.error("Failed generate new verification Token: ", error);
    throw error; // This will be caught by registerUser's try-catch
  }
}

export const userVerification = async (req, res) => {
  const token = req.params.token;
  console.log("verify user with token ", token);
  try {
    if (!token) {
      res.status(400).json({
        status: "failed",
        error: "Token can't be null"
      });
    }
    const user = await prisma.verificationToken.findFirst({
      where: {
        token, // Replace with your unique identifier
      },
      select: {
        idUser: true,
        tokenExpire: true
      },
    });
    if (!user) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Page</title>
          </head>
          <body>
            <h1>Failed to verify your account. Your verification token can't be null!</h1>
          </body>
        </html>
      `);
      return;
    }
    if (user.tokenExpire < new Date()) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Page</title>
          </head>
          <body>
            <h1>Failed to verify your account. Your verification token has been expired, please ask new verification token</h1>
          </body>
        </html>
      `);
      return;
    }
    const iduser = user.idUser
    await prisma.$transaction([
      prisma.traditionalUser.update({
        where: {
          idUser: iduser,
        },
        data: {
          verifiedAt: new Date(),
        },
      }),
      prisma.verificationToken.deleteMany({
        where: {
          idUser: iduser
        }
      }),
    ])
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verification Page</title>
        </head>
        <body>
          <h1>Your account verified successfully, please login</h1>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Failed verify the verification Token: ", error);
    throw error; // This will be caught by registerUser's try-catch
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await prisma.user.findUnique({
        where: {
          email: email, // Replace with your unique identifier
        },
        select: {
          id: true,
          email: true,
          userType: true,
        },
      });

      const traditionalUser = await prisma.traditionalUser.findUnique({
        where: {
          idUser: user.id,
        },
        select: {
          password: true,
          verifiedAt: true,
        }
      })

      console.log("User before re assign, ", user);
      
      // user = { ...user, password: traditionalUser.password, isVerified: traditionalUser.verifiedAt !== null };
      user.password = traditionalUser.password;
      user.isVerified = traditionalUser.verifiedAt !== null;
      
      console.log("User after re assign, ", user);

      if (!user) {
          res.status(404).json({ status: "failed", message: "User didn't find" });
          return;
      }
      res.status(200).json({ status: "success", message: "Login successfully" });
      return;
      // if (user.userType === UserType.OAUTH) {
      //   console.log("User type is Oauth");
      //   res.status(401).json({ status: "failed", message: "Please login with google" });
      //   return;
      // }

      // if (user.username && await bcrypt.compare(password, user.password)) {
      //   const accessToken = generateAccessToken({ userId: user.userId, username: user.username, email: user.email });
      //   // set cookies access and refresh token
      //   res.cookie('accessToken', accessToken, { signed: true, maxAge: 1200000, httpOnly: true, domain: "localhost", secure: true });
      //   const refreshToken = generateRefreshToken({ username: user.username, email: user.email });
      //   await redisClient.set(user.username, refreshToken, {
      //       EX: 24 * 60 * 60, // Set expiration time to 24 hours
      //   });
      //   res.status(200).json({ status: "success", message: "Login successfully", data: { accessToken, refreshToken } });
      // } else {
      //   res.status(401).json({ status: "failed", message: "Invalid Username or Password" });
      // }
  } catch (err) {
      res.status(500).json({ status: "failed", message: "Login error" });
  }
}