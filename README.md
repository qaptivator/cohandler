# Cohandler.js
Cohandler.js is JavaScript library what simplifies the process of handling commands, events, validations, components and even databases.

Discord.js version supported: `v14`
MongoDB connector supported: [Mongoose](https://mongoosejs.com/docs/index.html)

## Installation
To install Cohandler.js, simply run the following command:
For npm:

    npm i cohandler.js

## Usage

For **CommonJS modules**:
```javascript
// index.js
const { Client, GatewayIntentBits} = require('discord.js');
const { Cohandler, dirPathBuilder } = require('cohandler.js');

const client = new Client({
	intents: [GatewayIntentBits.Guilds] // Your bot's intents
})
	
new Cohandler(
	client, // Discord.js client object
	null, // Mongoose library object
	{
		commandsPath: dirPathBuilder('/commands', import.meta.url), // The commands folder
		eventsPath: dirPathBuilder('/events', import.meta.url), // The events folder
		componentsPath: dirPathBuilder('/components', import.meta.url), // The components folder
	},
	{
		testGuild: 'TEST_SERVER_ID', // To register guild-based commands (if not provided commands will be registered globally)
		includeTable: true, // To print out table of statuses of commands, events, components or models.
		includeCommandStatuses: true, // To print out statuses of registered commands.
	},	
)
	
client.login('YOUR_TOKEN_HERE');
```
For **ES modules**, replace `require` with `import`.
## File Structure
With Cohandler.js you can make a very flexible file structure for your commands. Here's a example of what your file structure could look like:
```
commands/
├── command1.js
├── command2.js
└── category/
	├── command3.js
	└── commands4.js
```
Any file inside the commands directory will be considered a command file, so make sure it properly exports an object. Like this:
```javascript
// commands/misc/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),

  run: ( interaction, client, models ) => {
    interaction.reply(`Pong! ${client.ws.ping}ms`);
  },

  // deleted: true, // Deletes the command from Discord (if you passed in a "testGuild" property it'll delete from the guild and not globally)
};
```
For **ES modules**, replace `require` with `import` and change from `module.exports` to `export default`. Same applies to every other file export or import.

 - `interaction`
 - `client`  is the Discord.js Client instance.
 - `models` is every Mongoose model you defined inside a [Collection](https://discordjs.guide/additional-info/collections.html#collections). This value will be defined only if you provided `mongoose` library and `modelsPath` parameter.
 ---
 ### Validations
 Validations are functions what get called before the actual command execution. Using this, you can make for example command only for specific user. To create validation, you should export function named `validation` inside the command's file with the `data` and `run` fields. Here is the example of how to make user specific command:
 ```javascript
 // commands/misc/dev.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('dev').setDescription('Developer only command.'),

validation: ( interaction, command, client, models ) => {
	if ( interaction.member.id  !== 'DEVELOPER_ID' ) {
			interaction.reply('This command is only for developers.')
			return true // To cancel command's execution, return true.
	}
},
  run: ( interaction, client, models ) => {
    interaction.reply(`You are a developer!`);
  },
};
 ```
 - `interaction`
 - `command`  is the is the command object exported from the command file itself. Properties such as `name`, `description` and `options` are all available within.
 - `client`  is the Discord.js Client instance.
 - `models` is every Mongoose model you defined inside a [Collection](https://discordjs.guide/additional-info/collections.html#collections). This value will be defined only if you provided `mongoose` library and `modelsPath` parameter.
 
 ---
 ### Events
 Cohandler.js requires a specific file structure for events, unlike commands. Here's a example of what your file structure could look like:
 ```
events/
├── ready/
|	├── console-log.js
|	└── webhook.js
|
└── messageCreate/
	├── auto-mod/
	|	├── delete-swear-words.js
	|	└── anti-raid.js
	|
	└── chat-bot.js
```
Make sure each file exports a default function. Like this:
```javascript
// events/ready/console-log.js
module.exports = (argument, client, models) => {
  console.log(`${client.user.tag} is online.`);
};
```
Or as the **ES modules** format:
```javascript
// events/ready/console-log.js
export default (argument, client, models) => {
  console.log(`${client.user.tag} is online.`);
};
```
-   `argument`  is the argument you receive from the event being triggered (you can name this whatever you want). For example, the  `messageCreate`  event will give you an argument of the message object.
-   `client`  is the Discord.js Client instance.
-   `models`  is every Mongoose model you defined inside a [Collection](https://discordjs.guide/additional-info/collections.html#collections). This value will be defined only if you provided `mongoose` library and `modelsPath` parameter.
---
### Components
Cohandler.js also supports components such as buttons, select menus and even modals.
In this scenario, Cohandler.js requires strict file structure. Here's a example of what your file structure could look like:
```
components/ 
├── buttons/ 
│ 	├── confirm.js 
│ 	├── cancel.js 
│ 	└── moderation/ 
│ 		└── banButton.js 
├── selectMenus/ 
│ 	├── stringSelects/ 
│ 	│ 	└── helpMenu.js 
│ 	└── roleMenu.js
└── modals/ 
	└── report.js
```
Make sure each file exports field `data` and `run`. Here is the example of how button file could look like:
```javascript
// components/buttons/confirm.js
module.exports = {
	data: {
		name: 'successButton', // Custom id of component what you defined in ButtonBuilder
	},
	run: ( interaction, client, models ) => {
		interaction.update('Success!')
	},
}
```
Or using the **ES modules**:
```javascript
// components/buttons/confirm.js
export default {
	data: {
		name: 'succesButton', // Custom id of component what you defined in ButtonBuilder
	},
	run: ( interaction, client, models ) => {
		interaction.update('Success!')
	},
}
```
- `interaction`
- `client` is the Discord.js Client instance.
- `models` is every Mongoose model you defined inside a [Collection](https://discordjs.guide/additional-info/collections.html#collections).
---
### Database
Cohandler.js also supports a connection to the database. 
Database connection is a different topic so it won't be covered here, but here are some links to tutorials:
- [How to setup MongoDB Atlas](https://www.youtube.com/watch?v=084rmLU1UgA)
- [Mongoose quick start](https://mongoosejs.com/docs/index.html)

After you had successfully installed and configured MongoDB and Mongoose, change your `index.js` a little. Here's a example:
```javascript
// index.js
const { Client, GatewayIntentBits} = require('discord.js');
const { Cohandler, dirPathBuilder } = require('cohandler.js');
const mongoose = require('mongoose');

mongoose.connect('MONGODB_URI');

const client = new Client({
	intents: [GatewayIntentBits.Guilds] // Your bot's intents
})
	
new Cohandler(
	client, // Discord.js client object
	mongoose, // Mongoose library object
	{
		commandsPath: dirPathBuilder('/commands', import.meta.url), // The commands folder
		eventsPath: dirPathBuilder('/events', import.meta.url), // The events folder
		componentsPath: dirPathBuilder('/components', import.meta.url), // The components folder
		modelsPath: dirPathBuilder('/models', import.meta.url)
	},
	{
		testGuild: 'TEST_SERVER_ID', // To register guild-based commands (if not provided commands will be registered globally)
		includeTable: true, // To print out table of statuses of commands, events, components or models.
		includeCommandStatuses: true, // To print out statuses of registered commands.
	},	
)

client.login('YOUR_TOKEN_HERE');
```

---
###  Models
[Models](https://mongoosejs.com/docs/models.html) are responsible for creating and reading documents from the underlying MongoDB database. To create one, you have to provide a [Schema](https://mongoosejs.com/docs/guide.html). To register models inside Cohandler.js, you should make a file inside the `models` directory that you provided. Here's an example of file structure for models:
```
models/ 
├── settings.js 
└── misc/ 
	├── bannedUsers.js 
	└── custom.js
```
This is an example of how should each file look like:
```javascript
// models/settings.js
const mongoose = require('mongoose');

let modelName = 'properties'
let schema = new  mongoose.Schema({
	someProperty: Boolean,
	name: String,
})

let model = mongoose.model(modelName, schema)

module.exports = { model, modelName }
```
Now Cohandler.js will register the model and you would be able to use it almost anywhere. It will be defined as `models` field. It's usually the last argument at functions.

[Here's a guide on how to interact with Mongoose models.](https://mongoosejs.com/docs/models.html)