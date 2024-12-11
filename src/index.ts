import "dotenv/config";
import ejs from "ejs";
import express, { Application, Request, Response } from "express";
import ExpressFileUpoad from "express-fileupload";
import * as path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Give local directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// for setup server
const app: Application = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
// for setup express.json() and express.urlencoded()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(limiter);
app.use(
    ExpressFileUpoad({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );
  
// * Set View engine
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));

// * Routes
import Router from "./routes/index.js";
app.use(Router);

app.get("/", async (req: Request, res: Response) => {
    const html = await ejs.renderFile(__dirname + "/views/emails/welcome.ejs", { name: "John" })
    // await sendEmail("paragvadgama123@gmail.com","Welcome to the club",html);
    await emailQueue.add(emailQueueName, { html: html, subject: "Welcome to the club", to: "paragvadgama123@gmail.com" })
    return res.json({ message: "Email sent successfully" })
})

// *Queue
import { limiter } from "./config/rateLimiter.js";
import { emailQueue, emailQueueName } from "./jobs/EmailQueue.js";
import "./jobs/index.js";


app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))