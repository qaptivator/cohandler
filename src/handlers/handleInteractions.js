export async function handleInteractions(client, models) {
    client.on('interactionCreate', async (interaction) => {
        let interactionData, errorMsg

        switch(true) {
            case interaction.isChatInputCommand():
                interactionData = client.commands.get(interaction.commandName);
                errorMsg = 'Command not found.';
                break;

            case interaction.isButton():
                interactionData = client.buttons.get(interaction.customId);
                errorMsg = 'Button not found.';
                break;

            case interaction.isStringSelectMenu():
                interactionData = client.selectMenus.get(interaction.customId);
                errorMsg = 'Select menu not found.';
                break;

            case interaction.isModalSubmit():
                interactionData = client.modals.get(interaction.customId);
                errorMsg = 'Modal not found.';
                break;

            default:
                errorMsg = 'Interaction not found.'
                break;
        }

        if (interactionData) {
            if (interactionData.validation) {
                const cantRun = await interactionData.validation(interaction, interactionData, client, models) ?? false
                
                if (!cantRun) {
                    try {
                        await interactionData.run(interaction, client, models)
                    } catch (err) {
                        throw new Error(err)
                    }
                }
            } else {
                try {
                    await interactionData.run(interaction, client, models)
                } catch (err) {
                    throw new Error(err)
                }
            }
        } else {
            interaction.reply({ content: errorMsg, ephemeral: true })
        }

        /*if (interaction.isChatInputCommand()) {
            let command = client.commands.get(interaction.commandName)

            if (command) {
                if (command.validation) {
                    const canRun = await !command.validation(interaction, command, client, models)
    
                    if (canRun) {
                        await command.run(interaction, client, models)
                    }
                } else {
                    await command.run(interaction, client, models)
                }
            } else {
                interaction.reply({ content: 'Command not found.', ephemeral: true })
            }
        } else if (interaction.isButton()) {
            let button = client.buttons.get(interaction.customId)

            if (button) {
                if (button.validation) {
                    const canRun = await !button.validation(interaction, button, client, models)
    
                    if (canRun) {
                        await button.run(interaction, client, models)
                    }
                } else {
                    await button.run(interaction, client, models)
                }
            } else {
                interaction.reply({ content: 'Button not found.', ephemeral: true })
            }
        }*/
    })
}