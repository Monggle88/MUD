import { createClient } from 'redis';
import { Emitter } from '@socket.io/redis-emitter';
import env from './env';


const { REDIS_URL } = env;
const redisClient = createClient({ url: REDIS_URL });

redisClient.connect()
const io = new Emitter(redisClient);
const BATTLE = io.of('/battle');

export default BATTLE;
