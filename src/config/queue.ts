import { ConnectionOptions, DefaultJobOptions } from "bullmq";
import IORedis from "ioredis";
// https://docs.bullmq.io/readme-1
// https://www.npmjs.com/package/ioredis

// If We Have Password (Withou Io Redis)
// export const redisConnection:ConnectionOptions = {
//     host: process.env.REDIS_HOST,
//     port: 6379,
//     password:process.env.REDIS_PASSWORD,
//   };

export const redisConnection: ConnectionOptions = ({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)!,
  password: process.env.REDIS_PASSWORD,
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
    removeOnFail:false
}
