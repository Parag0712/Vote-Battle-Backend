import { Job, Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
import { sendEmail } from "../config/mail.js";

interface EmailQueueData{
    html:string;
    subject:string;
    to:string;
}

export const emailQueueName = "emailQueue";

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueConfig
})

// Worker
export const hanlder = new Worker(
    emailQueueName, 
    async (job: Job) => {
        const data: EmailQueueData = job.data;
        await sendEmail(data.to, data.subject, data.html)
    },
    {
        connection: redisConnection
    }
)