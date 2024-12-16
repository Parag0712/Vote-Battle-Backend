import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
import { sendEmail } from "../config/mail.js";
export const emailQueueName = "emailQueue";
export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueConfig
});
// Worker
export const hanlder = new Worker(emailQueueName, async (job) => {
    const data = job.data;
    await sendEmail(data.to, data.subject, data.html);
}, {
    connection: redisConnection
});
