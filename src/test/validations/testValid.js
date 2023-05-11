export default (interaction) => {
    if (interaction.member.id !== process.env.DEV_ID) {
        interaction.reply('This command is for the developer only')
        return true
    }
}