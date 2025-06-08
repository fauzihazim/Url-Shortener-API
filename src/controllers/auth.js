// import express from 'express';
import { PrismaClient, Prisma } from "@prisma/client";
import {google} from 'googleapis';
import crypto from 'crypto';
import 'dotenv/config';
import { email } from "zod/v4";
// import {User} from "../interfaces/User"
import {OauthUser, UserType} from "../models/User.js";

const prisma = new PrismaClient();
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
    
    const findUser = await prisma.user.findUnique({
      where: {
        email: data.email
      },
    });

    // const newUser = new OauthUser(data.email, "OAUTH", data.verified_email);
    const newUser = new OauthUser(
      data.email,                   // Required
      UserType.OAUTH,               // Hardcoded for OAuth users
      data.verified_email           // From request
    );
    newUser.log();
    console.log("Find user: ", typeof findUser, findUser);
    
    if (!findUser) {
      console.log("Saving ", await newUser.save());
      // console.log("Saving");
    }
    res.send(data);
    // res.status(201).json({  
    //   status: "success",
    //   message: "User registered successfully",
    //   user: {
    //     id: 1,
    //     email: "email1",
    //     username: "Username1"
    //   }, 
    //   data: {  
    //     accessToken: "accessToken",
    //     refreshToken: "refreshToken"
    //   }
    // });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: "Internal server error"
    });
  }
  


  // class OAuthUser extends User {
  //   constructor(user) {
  //     this.name = user.name;
  //     this.
  //   }
  // }

  // if (!findUser) {
  //   const newUser: User
  // }
}