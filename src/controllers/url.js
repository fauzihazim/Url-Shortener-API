// import express from 'express';
import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from "../../script.js";

// const app = express();
const prisma = new PrismaClient();

export const getLongUrl = async (req, res) => {
    const shortUrl = req.params.id;
    console.log("Short URL, ", shortUrl);
    
    try {
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
                status: "error",
                message: "Short URL not found",
                url: shortUrl,
            });
            return;
        }
        res.redirect(301, longUrl.longUrl);
    } catch (error) {
        const statusCode = error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500;
        return res.status(statusCode).json({
            status: "error",
            message: "An error occurred while processing your request",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}

export const addUrl = async (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) {
        return res.status(400).json({ error: "Missing 'longUrl' in request body" });
    }
    try {
        const newUrl = await prisma.url.create({
            data: {
                longUrl: longUrl,
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
            success: true,
            shortUrl: `${baseUrl}${updatedUrl.shortUrl}`,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", message: error.message });
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

// POST route
export const api = async (req, res) => {
    const { name, age } = req.body;
    if (!name || !age) {
        return res.status(400).json({ message: 'Name and age are required' });
    }
    res.json({ message: `Received data for ${name}, age ${age}` });
};
