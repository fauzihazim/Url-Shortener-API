import { PrismaClient, Prisma } from "@prisma/client";
import {google} from 'googleapis';
import crypto from 'crypto';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { nowDatetime } from "../utils/nowDatetimeUtils.js";
import { email, success } from "zod/v4";
import {OauthUser, TraditionalUser, UserType} from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils.js";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUR_CLIENT_ID,
  process.env.YOUR_CLIENT_SECRET,
  process.env.YOUR_REDIRECT_URL
);
const dateTimeNow = nowDatetime();
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
    const findUser = await findingUser(data.email);
    if (findUser) {
      res.status(409).json({
        status: "failed",
        error: "Email has been used"
      });
      return;
    };
    const newUser = new OauthUser(
      data.email,
      UserType.OAUTH,
      data.verified_email
    );
    const saveUser = await newUser.save();
    res.status(201).json({  
      status: "success",
      message: "User registered successfully",
      data: {
        accessToken: generateAccessToken({ sub: saveUser.user.id }),
        refreshToken: generateRefreshToken({ sub: saveUser.user.id })
      }
    });
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
    validateEmailAndPassword.parse({email, password});
    const findUser = await findingUser(email);
    res.locals.dateTimeNow = dateTimeNow;
    if (findUser) {
      res.locals.userId = findUser.id;
      res.status(409).json({  
        status: "failed",
        error: "Email has been used"
      });
      return;
    }
    const newUser = new TraditionalUser(
      email,
      password,
      dateTimeNow
    );
    const saveUser = await newUser.save();
    res.locals.userId = saveUser.user.id;
    const verificationToken = generateVerificationToken();
    await sendVerificationEmail(email, verificationToken);
    await saveAndDeleteOldVerificationToken(saveUser.user.id, verificationToken);
    res.status(201).json({
      status  : "success",
      message : "User registered successfully, please check verification in your email"
    });
    return;
  } catch (error) {
    if(error instanceof z.ZodError){
      const err = error.issues;
      return res.status(500).json({
        status: "failed",
        error: err[0].message
      });
    };
    res.status(500).json({
      status: "failed",
      error: "Internal server error"
    });
  }
}

const validateEmailAndPassword = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const findingUser = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      email: true,
      userType: true,
    },
  });
}

const sendVerificationEmail = async (email, verificationToken) => {
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
  const mailOptions = {
    from: 'beta4590@gmail.com',
    to: email,
    subject: 'Email Verification',
    html: `
      <p>Please click the following link to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
}

const generateVerificationToken = () => {
  return nanoid(32);
}

const tokenExpired = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);;
}

export const askNewToken = async(req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  res.locals.dateTimeNow = dateTimeNow;
  try {
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        error: 'Email and password cannot be null'
      });
    }
    if (!z.string().email().safeParse(email).success) {
      return res.status(400).json({
        status: "failed",
        error: 'Invalid email format'
      });
    }
    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
        userType: UserType.TRADITIONAL
      }, select: {
        id: true,
        traditionalUser: {
          where: {
            verifiedAt: null,
          }, select: {
            password: true
          },
        },
      },
    });
    if (!findUser) {
      return res.status(404).json({
        status: "failed",
        error: 'Did not find your account!'
      });
    };
    res.locals.userId = findUser.id;
    
    const { traditionalUser, ...user } = findUser;
    if (!traditionalUser) {
      return res.status(404).json({
        status: "failed",
        error: 'You had registered your account!'
      });
    }
    if (!await bcrypt.compare(password, traditionalUser.password)) {
      return res.status(401).json({
        status: "failed",
        error: "Invalid Username or Password"
      });
    };
    const verificationToken = generateVerificationToken();
    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { idUser: user.id } }),
      prisma.verificationToken.create({
        data: {
          idUser: user.id,
          token: verificationToken,
          tokenExpire: tokenExpired(),
        }
      }),
    ]);
    await sendVerificationEmail(email, verificationToken);
    return res.status(200).json({ status: "success", message : "Token has been sending to your email, please check your email"});
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Internal server error"
    });
  }
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
    throw error;
  }
}

export const userVerification = async (req, res) => {
  const token = req.params.token;
  try {
    res.locals.dateTimeNow = dateTimeNow;
    if (!token) {
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
    const user = await prisma.verificationToken.findFirst({
      where: {
        token,
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
            <h1>Failed to verify your account. User didn't find!</h1>
          </body>
        </html>
      `);
      return;
    }
    res.locals.userId = user.idUser;
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
    const iduser = user.idUser;
    await prisma.$transaction([
      prisma.traditionalUser.update({
        where: {
          idUser: iduser,
        },
        data: {
          verifiedAt: dateTimeNow,
        },
      }),
      prisma.verificationToken.deleteMany({
        where: {
          idUser: iduser
        }
      }),
    ]);
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
    res.status(500).json({
      status: "failed",
      error: "Internal server error"
    });
  }
}

export const login = async (req, res) => {
  res.locals.dateTimeNow = dateTimeNow;
  try {
    const { email, password } = req.body;
    validateEmailAndPassword.parse({email, password});
    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
        userType: UserType.TRADITIONAL
      }, select: {
        id: true,
        traditionalUser: {
          where: {
            verifiedAt: {
              not: null
            }
          }, select: {
            password: true
          },
        },
      },
    });
    const { traditionalUser, ...user } = findUser;
    res.locals.userId = user.id;
    if (!user) {
      res.status(404).json({
        status: "failed",
        error: "User didn't find"
      });
      return;
    }
    if (!traditionalUser) {
      res.status(401).json({
        status: "failed",
        error: "User hasn't registered"
      });
      return;
    }
    if (!await bcrypt.compare(password, traditionalUser.password)) {
      return res.status(401).json({
        status: "failed",
        error: "Invalid Username or Password"
      });
    };
    res.status(200).json({ status: "success",
      message: "Login successfully",
      data: {
        accessToken: generateAccessToken({ sub: user.id }),
        refreshToken: generateRefreshToken({ sub: user.id })
      }
    });
    return;
  } catch (error) {
    if(error instanceof z.ZodError){
      const err = error.issues;
      return res.status(500).json({
        status: "failed",
        error: err[0].message
      });
    };
    res.status(500).json({
      status: "failed",
      error: "Login error"
    });
  }
}