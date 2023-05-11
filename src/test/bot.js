import { Cohandler } from "../index.js";
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] })

const handler = new Cohandler(
    client, 
    null, 
    {
       commandsPath: './commands',
    },
    {
        testGuild: process.env.TEST_GUILD,
    },
);

client.login(process.env.TOKEN)