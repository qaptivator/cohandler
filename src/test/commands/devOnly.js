import { SlashCommandBuilder } from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('guild comamnd only for devs'),
    validation: (interaction, command, client, models) => {
        if (interaction.member.id !== process.env.DEV_ID) {
            interaction.reply('this command is for the developer only smh')
            return true
        }
    },
    run: (interaction, client, models) => {
        interaction.reply("you are a dev gg")
    },
}