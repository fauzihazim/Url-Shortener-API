import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from "../../script.js";
import { z } from 'zod';
import { nowDatetime } from "../utils/nowDatetimeUtils.js";

const prisma = new PrismaClient();

export const getLongUrl = async (req, res) => {
    try {
        const shortUrl = req.params.id;
        console.log("Short URL ", shortUrl);
        
        console.log("Here");
        
        const longUrl = await prisma.url.findUnique({
            where: {
                shortUrl: shortUrl
            },
            select: {
                id: true,
                analyticsUrl: true,
                longUrl: true,
            },
        })
        console.log("Here");
        if (longUrl === null) {
            res.status(404).json({
                status: "failed",
                error: "Short URL not found"
            });
            return;
        }
        // tx.url.update({
        //             where: { id: newUrl.id },
        //             data: { shortUrl: generateShort(newUrl.id) },
        //         });
        if ( longUrl.analyticsUrl ) {
            await prisma.analyticsUrl.update ({
                where: { id: longUrl.id },
                data: {
                    totalClick: { increment: 1 },
                    lastClicked: nowDatetime(),
                }
            })
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
    const { longUrl } = req.body;
    console.log(longUrl);
    
    try {
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
        
        const updatedUrl = await prisma.$transaction(async (tx) => {
            if (!res.locals.userId) {
                const updatedUrl = await tx.url.update({
                    where: { id: newUrl.id },
                    data: { shortUrl: generateShort(newUrl.id) },
                });
                return updatedUrl;
            }
            const updatedUrl = await tx.url.update({
                where: { id: newUrl.id },
                data: { shortUrl: generateShort(newUrl.id), analyticsUrl: true },
            });
            await tx.analyticsUrl.create({
                data: { id: updatedUrl.id }
            });
            return updatedUrl;
        })
        res.status(201).json({
            status: "success",
            message: "Url added successfully",
        data: {
            shortUrl: `${baseUrl}/d/${updatedUrl.shortUrl}`,
            analyticsUrl: newUrl.idUser
        }});
        
    } catch (error) {
        console.error('Error adding url:', error);
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

export const analyticsUrl = async (req, res) => {
    try {
        const shortUrl = req.params.id;
        console.log("The short URL, ", shortUrl);
        const userId = res.locals.userId;
        console.log("The User Id, ", userId);
        const getUrl = await prisma.url.findUnique ({
            where: { shortUrl: shortUrl },
            select: {
                id: true,
                longUrl: true
            }
        });
        const getAnalyticsUrl = await prisma.analyticsUrl.findUnique ({
            where: { id: getUrl.id },
            select: {
                totalClick: true,
                lastClicked: true,
            }
        });
        console.log("Get Url Id", getUrl);
        
        
        res.status(200).json({
            status: "success",
            data: {
                longUrl: getUrl.longUrl,
                totalClick: getAnalyticsUrl.totalClick,
                lastClicked: getAnalyticsUrl.lastClicked
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            error: "Internal server error"
        });
    }
}