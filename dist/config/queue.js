export const redisConnection = ({
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
});
export const defaultQueueConfig = {
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
};
