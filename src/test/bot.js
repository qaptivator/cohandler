import { config } from "dotenv";
config();

import { Cohandler, dirPathBuilder } from "../index.js";
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI)

let client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

let handler = new Cohandler(
    client,
    mongoose,
    {
       commandsPath: dirPathBuilder('/commands', import.meta.url),
       eventsPath: dirPathBuilder('/events', import.meta.url),
       componentsPath: dirPathBuilder('/components', import.meta.url),
       modelsPath: dirPathBuilder('/models', import.meta.url),
    },
    {
        testGuild: process.env.TEST_GUILD,
        includeTable: true,
        includeCommandStatuses: true
    },
);

client.login(process.env.TOKEN);