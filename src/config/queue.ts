import { ConnectionOptions, DefaultJobOptions } from "bullmq";

export const redisConnection: ConnectionOptions = ({
    url:process.env.REDIS_URL,
    maxRetriesPerRequest: null,
});

export const defaultQueueConfig: DefaultJobOptions = {
    removeOnComplete: {
        count: 20,
        age: 60 * 60
    },
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000
    },
    removeOnFail: false
}
