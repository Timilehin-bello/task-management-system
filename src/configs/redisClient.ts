import { config } from "./config";
import * as Redis from "redis";

const url = `${config.redis.protocol}://${config.redis.host}:${config.redis.port}`;
// const url = `${config.redis.protocol}://${config.redis.username}:${config.redis.password}@${config.redis.host}:${config.redis.port}`;

// console.log("url", url);

const redisClient: Redis.RedisClientType = Redis.createClient({ url });

if (config.redis.userPassword.toUpperCase() === "YES") {
  redisClient.auth(config.redis.password);
}

export default redisClient;
