// import express from 'express';
import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from "../../script.js";
import { z } from 'zod';

// const app = express();
const prisma = new PrismaClient();

export const getLongUrl = async (req, res) => {
    try {
        const shortUrl = req.params.id;
        const longUrl = await prisma.url.findUnique({
            where: {
                shortUrl: shortUrl
            },
            select: {
                longUrl: true, // Only fetch this column
            },
        })
        if (longUrl === null) {
            res.status(404).json({
                status: "failed",
                error: "Short URL not found"
            });
            return;
        }
        res.redirect(301, longUrl.longUrl);
    } catch (error) {
        const statusCode = error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500;
        return res.status(statusCode).json({
            status: "failed",
            error: "An error occurred while processing your request"
        });
    }
}

export const getUrl = async (req, res) => {
    try {
        const shortUrl = req.params.id;
        const longUrl = await prisma.url.findUnique({
            where: {
                shortUrl: shortUrl
            },
            select: {
                longUrl: true, // Only fetch this column
            },
        })
        if (longUrl === null) {
            res.status(404).json({
                status: "failed",
                error: "Short URL not found"
            });
            return;
        }
        res.status(200).json({
            status: "success",
            shortUrl,
            longUrl: longUrl.longUrl
        });
    } catch (error) {
        const statusCode = error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500;
        return res.status(statusCode).json({
            status: "failed",
            error: "An error occurred while processing your request"
        });
    }
}

export const addUrl = async (req, res) => {
    try {
        console.log("Ini Req body", req.body);
        
        const { longUrl } = req.body;
        console.log("Long URL is ", longUrl);
        
        // Validation
        if (!z.string().url().safeParse(longUrl).success) {
            return res.status(400).json({
                status: "failed",
                error: 'Invalid URL format'
            });
        }
        console.log("Halo");
        
        const newUrl = await prisma.url.create({
            data: {
                longUrl,
                shortUrl: uuidv4(),
                createdAt: nowDatetime()
            }
        })

        // Update with short code
        const updatedUrl = await prisma.url.update({
            where: { id: newUrl.id },
            data: { shortUrl: generateShort(newUrl.id) },
        });
        res.status(201).json({
            status: "success",
            shortUrl: `${baseUrl}${updatedUrl.shortUrl}`,
        });
        
    } catch (error) {
        res.status(500).json({
            status: "failed",
            error: "Internal server error"
        });
    }
}

const nowDatetime = () => {
    const date = new Date();
    // Convert to Jakarta Time
    const now = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    // Convert to ISO-8601 DateTime
    const isoNow = now.toISOString();
    return isoNow;
}

const generateShort = (id) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let shortUrl = '';
  while (id > 0) {
    shortUrl = chars[id % 62] + shortUrl;
    id = Math.floor(id / 62);
  }
  return shortUrl.padStart(6, getRandomInt());
}

function getRandomInt() {
  const min = Math.ceil(0);
  const max = Math.floor(62);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}