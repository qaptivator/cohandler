import { Cohandler } from "../index.js";
import { Client, GatewayIntentBits } from 'discord.js';

let client = new Client({ intents: [ GatewayIntentBits.Guilds ] })

let handler = new Cohandler(
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