import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from "../../script.js";
import { z } from 'zod';
import { nowDatetime } from "../utils/nowDatetimeUtils.js";

const prisma = new PrismaClient();

export const getLongUrl = async (req, res) => {
    try {
        const shortUrl = req.params.id;
        const longUrl = await prisma.url.findUnique({
            where: {
                shortUrl: shortUrl
            },
            select: {
                longUrl: true,
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
                longUrl: true,
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
        const { longUrl } = req.body;
        const dateTimeNow = nowDatetime();
        if (!z.string().url().safeParse(longUrl).success) {
            return res.status(400).json({
                status: "failed",
                error: 'Invalid URL format'
            });
        }
        res.locals.dateTimeNow = dateTimeNow;
        const newUrl = await prisma.url.create({
            data: {
                longUrl,
                idUser: res.locals.userId,
                shortUrl: uuidv4(),
                createdAt: dateTimeNow
            }
        });
        const updatedUrl = await prisma.url.update({
            where: { id: newUrl.id },
            data: { shortUrl: generateShort(newUrl.id) },
        });
        res.status(201).json({
            status: "success",
            message: "Url added successfully",
        data: {
            shortUrl: `${baseUrl}/d/${updatedUrl.shortUrl}`,
        }});
        
    } catch (error) {
        res.status(500).json({
            status: "failed",
            error: "Internal server error"
        });
    }
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