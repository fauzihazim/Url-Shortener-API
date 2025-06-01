// import express from 'express';
import { PrismaClient, Prisma } from "@prisma/client";

// const app = express();
const prisma = new PrismaClient();

export const getUrl = async (req, res) => {
    const shortUrl = req.params.id;
    try {
        const longUrl = await prisma.url.findUnique({
            where: {
                shortUrl: shortUrl
            },
            select: {
                longUrl: true, // Only fetch this column
            },
        })
        console.log("Long URL ", longUrl);
        if (longUrl === null) {
            res.status(404).json({
                status: "error",
                message: "Short URL not",
                url: shortUrl,
            });
            return;
        }
        res.redirect(301, longUrl.longUrl);
    } catch (error) {
        console.error(`Error processing ${shortCode}:`, error);
        // 4. Handle different error types
        const statusCode = error instanceof Prisma.PrismaClientKnownRequestError ? 400 : 500;
        return res.status(statusCode).json({
            status: "error",
            message: "An error occurred while processing your request",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}