# Circles Platform

The Circles Platform is a full-stack Next.js web application built for The Flybottle to manage "Circles"—community discussion groups and courses. It handles everything from user registration and circle proposals to administrative management and mass communication.

## Features

- **Circle Registration & Proposals:** Users can propose new circles or register for existing ones.
- **Admin Dashboard:** A centralized portal for admins and super admins to review proposals, approve/reject circles, and manage platform data.
- **Automated Communication:** Integrated with Resend for sending automated email notifications (e.g., new registrations) and mass BCC emails to circle members directly from the admin dashboard.
- **Asset Uploads:** Seamless file uploading for promotion images and syllabus documents using UploadThing.
- **Cron Jobs:** Automated background tasks (e.g., sending Telegram invite links to registered users).
- **Authentication:** Secure login and role-based access control (Admin, Super Admin) using NextAuth.js.
- **Performance Tracking:** Integrated with Vercel Analytics and Speed Insights for monitoring user experience.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **File Uploads:** [UploadThing](https://uploadthing.com/)
- **Email Delivery:** [Resend](https://resend.com/)
- **Deployment & Analytics:** [Vercel](https://vercel.com/)

## Getting Started

First, ensure you have the necessary environment variables set up in `.env.local`. You will need keys for MongoDB, NextAuth, UploadThing, and Resend.

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The application requires the following environment variables. Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Resend
RESEND_API_KEY=
```
*(Check the internal documentation for the full list of required variables)*

## Deployment

The project is hosted on Vercel: [circles-platform.vercel.app](https://circles-platform.vercel.app/)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
