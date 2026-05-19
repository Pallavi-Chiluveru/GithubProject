import exp from 'express'
import fs from 'fs';
import {connect} from 'mongoose'
import { config } from 'dotenv';
import { userApp } from './apis/userAPI.js';
import { repoApp } from './apis/repoAPI.js';
import { collabApp } from './apis/collabAPI.js';
import { issueApp } from './apis/issueAPI.js';
import { fileApp } from './apis/fileAPI.js';
import { prApp } from './apis/prAPI.js';
import { commitApp } from './apis/commitAPI.js';
import { notificationApp } from './apis/notificationAPI.js';
import { activityApp } from './apis/activityAPI.js';
import { orgApp } from './apis/orgAPI.js';
import { achievementApp } from './apis/achievementAPI.js';
import { chatApp } from './apis/chatAPI.js';
import { spaceApp } from './apis/spaceAPI.js';
import teamApp from './apis/teamAPI.js';
import discussionApp from './apis/discussionAPI.js';
import labelApp from './apis/labelAPI.js';
import { branchApp } from './apis/branchAPI.js';
import { webhookApp } from './apis/webhookAPI.js';
import { projectApp } from './apis/projectAPI.js';
import { wikiApp } from './apis/wikiAPI.js';
import { workflowApp } from './apis/workflowAPI.js';
import settingsApp from './apis/settingsAPI.js';

import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from './socket.js';

config();
const app = exp();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);
app.set('io', io);

// middle wares
app.use(cors({
  origin: process.env.CLIENT_URL || ["http://127.0.0.1:5173", "http://localhost:5173"],
  credentials: true,
}));
app.use(exp.json());
app.use(cookieParser());
const connectDB=async()=>{
    try{
        await connect(process.env.DB_URL);
    console.log("connected to database");

    const port = process.env.PORT || 5000;
    server.listen(port, () => console.log(`server started on port ${port}`))
    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`\x1b[31mError: Port ${port} is already in use.\x1b[0m`);
            console.log(`Try running: \x1b[36mnetstat -ano | findstr :${port}\x1b[0m to find the PID, then \x1b[36mtaskkill /PID <PID> /F\x1b[0m to kill it.`);
            process.exit(1);
        }
    });
    }
    catch(err){
        console.log("error in db connection");
    }
}
connectDB();

app.use('/user-api',userApp);
app.use('/repo-api',repoApp);
app.use('/collab-api',collabApp);
app.use('/issue-api',issueApp);
app.use('/file-api',fileApp);
app.use('/commit-api',commitApp);
app.use('/pr-api',prApp);
app.use('/notification-api',notificationApp);
app.use('/activity-api',activityApp);
app.use('/org-api', orgApp);
app.use('/achievement-api', achievementApp);
app.use('/chat-api', chatApp);
app.use('/space-api', spaceApp);
app.use('/team-api', teamApp);
app.use('/discussion-api', discussionApp);
app.use('/label-api', labelApp);
// ─── Gitea Integration Routes ────────────────────────────────────────────────────
app.use('/branch-api', branchApp);
app.use('/webhook-api', webhookApp);
app.use('/project-api', projectApp);
app.use('/wiki-api', wikiApp);
app.use('/workflow-api', workflowApp);
app.use('/repo-api', settingsApp);

// error handling middleware[ALWAYS KEEP AT END OF THE FILE]
app.use((err, req, res, next) => {
  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  console.log("Error cause:", err.cause);
  console.log("Full error:", JSON.stringify(err, null, 2));

  // ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message
    });
  }

  // CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  // Duplicate key error
  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];

    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`
    });
  }

  // Server error
  const errorLog = `[${new Date().toISOString()}] 500 ERROR: ${err.message}\nStack: ${err.stack}\n\n`;
  fs.appendFileSync('backend.err.log', errorLog);
  console.error("UNCAUGHT ERROR:", err);
  res.status(500).json({
    message: "error occurred",
    error: err.message,
    stack: err.stack
  });
});
