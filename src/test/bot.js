import { config } from "dotenv";
config()

import { Cohandler, dirPathBuilder } from "../index.js";
import { Client, GatewayIntentBits } from 'discord.js';

let client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

let handler = new Cohandler(
    client,
    null,
    {
       commandsPath: dirPathBuilder('/commands', import.meta.url),
       eventsPath: dirPathBuilder('/events', import.meta.url),
    },
    {
        testGuild: process.env.TEST_GUILD,
        includeTable: true
    },
);

client.login(process.env.TOKEN);