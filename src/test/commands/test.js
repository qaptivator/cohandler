import { SlashCommandBuilder } from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test guild command'),
    run: (interaction, client, models) => {
        interaction.reply("kumalala kumalala kumalala savesta")
    },
}