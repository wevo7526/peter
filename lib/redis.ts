import { createClient, RedisClientType } from 'redis';

const client: RedisClientType = createClient({
    username: 'default',
    password: 'a1j72JVLSSiGVdvzbeiBiJJQg2VlnTjv',
    socket: {
        host: 'redis-10648.c56.east-us.azure.redns.redis-cloud.com',
        port: 10648
    }
});

client.on('error', (err: Error) => console.log('Redis Client Error', err));

// Connect to Redis
client.connect().catch(console.error);

export default client; 