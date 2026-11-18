# ServiceBridge

This folder combines the eight supplied phase archives in order. Shared files use the newest phase version; files omitted from a later archive are retained from the phase that introduced them. The supplied archives did not include the original server foundation files, so the missing authentication, user model, database connection, and shared middleware were recreated to match the later phase APIs.

## What is included

- Customer, professional, and admin web app
- Professional profiles, verification, locations, and categories
- Service requests, quotations, bookings, OTP confirmation, payments, payouts, notifications, and video verification
- Reviews, complaints, and admin analytics
- MongoDB-backed API with cookie-based login and Socket.IO signalling

## Requirements

- Node.js 18 or newer and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)
- Optional: Razorpay test credentials for payment checkout and webhooks
- Optional: Google Maps browser key for map tiles

## Configure

1. Open a terminal in `server` and create `.env` from `.env.example`.
2. Set `MONGO_URI` to your MongoDB connection string. For a local MongoDB server, use `mongodb://127.0.0.1:27017/servicebridge`.
3. Replace `JWT_SECRET` with a long random secret. Keep `.env` private.
4. Optionally set Razorpay test keys. Leave the values blank to run without payment checkout.
5. In `client`, create `.env` from `.env.example`. Set `VITE_GOOGLE_MAPS_KEY` only if you have a Google Maps JavaScript API key; the app also has a basic map view without it.

## Install and run

In one terminal:

```sh
cd server
npm install
npm run seed:admin
npm run seed:demo
npm run dev
```

In a second terminal:

```sh
cd client
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The API health check is at `http://localhost:5000/api/health`.

## Demo accounts

The seed scripts create demo data in the database configured by `server/.env`:

- Admin: `admin@servicebridge.test` / `Admin12345`
- Customer: `demo.customer@servicebridge.test` / `Demo12345`
- Professionals: `demo.pro1@servicebridge.test` through `demo.pro5@servicebridge.test` / `Demo12345`

These are development-only accounts. Change or remove them before deploying the app for real users. Never use real identity documents or live payment keys with this prototype.

## Notes

- `client/.env` values are read when Vite starts; restart the client after changing them.
- Payment checkout needs Razorpay test keys. The rest of the app can run without them.
- Video calls use browser camera/microphone permissions and are most reliable on localhost or HTTPS.
- MongoDB must be running and reachable before starting the API or running seed commands.
