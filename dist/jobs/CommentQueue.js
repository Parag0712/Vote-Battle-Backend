import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
import prisma from "../config/database.js";
export const commentQueueName = "commentQueue";
export const commentQueue = new Queue(commentQueueName, {
    connection: redisConnection,
    defaultJobOptions: {
        ...defaultQueueConfig,
        delay: 500
    }
});
// *Worker
export const handler = new Worker(commentQueueName, async (job) => {
    const data = job.data;
    await prisma.clashComments.create({
        data: {
            comment: data.comment,
            clash_id: Number(data.clashId),
        }
    });
}, {
    connection: redisConnection
});
