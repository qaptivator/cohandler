import { config } from "dotenv";
config();

import path from 'path'
import { getDirname } from '../utils/getDirName.js'
const __dirname = getDirname(import.meta.url)
import { Cohandler } from "../index.js";
import { Client, GatewayIntentBits } from 'discord.js';

let client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

let handler = new Cohandler(
    client,
    undefined, 
    {
       commandsPath: path.join(__dirname, '/commands'),
       eventsPath: path.join(__dirname, '/events'),
    },
    {
        testGuild: process.env.TEST_GUILD,
        includeTable: true
    },
);

client.login(process.env.TOKEN);