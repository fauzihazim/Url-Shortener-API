# 🔗 Url-Shortener-API
## What is it ?
A fast and secure URL shortening service built with **Node.js**, **Express**, **MySQL**, and **Nginx** for load balancing. This API allows users to generate short links, redirect to original URLs, and track usage—all while **JWT-based authentication** and **GoogleOauth 2.0**.
## The Features
| Feature         | Description |
|---------------|------------|
| Login with Google Account | Users can login with Google Account via `/auth/google` an then It will generate access and refresh token. |
| Register account | It will registering your account via `/register`. You have to add req.body email and password, after that It will send verification link on your mail |
| Verify account | In your email It will be verification link and after click the link It will be verifying your account automatically. |
| Login | It will login to your account via `/login` by adding email and password to your req.body |
| Add Url | User can add url to generate short url |
| Access Short Url | User can access url from `/d/your-short-url` |

## Technology
- Javascript
- Node Js
- Express
- MySQL
- Docker
- Nginx

## Running with docker
1. Clone
``` git clone https://github.com/fauzihazim/Url-Shortener-API ```
2. Go to the folder
``` cd Url-Shortener-API ```
3. make .env file that contain
```bash
# For Database
DATABASE_URL = paste-database-url-here                          # Follow this guide https://www.prisma.io/docs/orm/reference/connection-urls#:~:text=Prisma%20ORM%20needs%20a%20connection%20URL%20to%20be,of%20a%20datasource%20block%20in%20your%20Prisma%20schema.

# For Google Oauth 2.0
YOUR_CLIENT_ID = paste-your-client-id-here                      # Follow this guide https://dev.to/fauzihazim/google-oauth-20-in-node-js-5e2a
YOUR_CLIENT_SECRET = paste-your-client-secret-here
YOUR_REDIRECT_URL = paste-your-redirect-url-here

# For JWT
ACCESS_TOKEN_SECRET = paste-your-access-token-secret-here
REFRESH_TOKEN_SECRET = paste-your-refresh-token-secret-here

GMAIL = paste-your-email-here                                   # Follow this guide https://www.youtube.com/watch?v=k-6KFSnaFTU&t=200s
GMAIL_CLIENT_ID = paste-your-gmail-client-id-here
GMAIL_CLIENT_SECRET = paste-your-gmail-client-secret-here
GMAIL_REFRESH_TOKEN = paste-your-gmail-refresh-token-here
```


4. Download and start Docker
5. Run Docker Compose
``` docker-compose up --build ```


## Authors
- [@fauzihazim](https://www.github.com/fauzihazim)