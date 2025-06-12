import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import messageRoutes from "./routes/messageRoutes.js"
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import bodyParser from 'body-parser'
import cors from 'cors'
import { app, server } from './lib/socket.js';

import path from 'path'
import exp from 'constants';

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}))

app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {

    app.set("trust proxy", 1);
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

server.listen(PORT, () => {
    connectDB();
    console.log("server is running on port:" + PORT)
})
