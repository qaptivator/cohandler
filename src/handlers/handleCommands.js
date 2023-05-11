import { foreachDir } from "../utils/fileUtils.js"
import { areCommandsDifferent } from "../utils/areCommandsDifferent.js"
import AsciiTable from 'ascii-table'
import chalk from 'chalk'

export async function initializeCommands(client, commandPaths, includeTable = false) {
    client.commands.clear()

    let commandStatus = new AsciiTable().setHeading('Command', 'Status')

    await foreachDir(commandPaths, async (commandPath) => {
        let { default: command } = await import(commandPath)
        let commandName = command.data.name

        if (!command.data) {
            commandStatus.addRow(commandName, '✗')
            throw new Error(`File ${commandPath} must export "data".`)
        }

        if (!command.run) {
            commandStatus.addRow(commandName, '✗')
            throw new Error(`File ${commandPath} must export a "run" function.`)
        }

        if (!commandName) {
            commandStatus.addRow(commandName, '✗')
            throw new Error(`File ${commandPath} must have a command name.`)
        }

        if (!command.data.description) {
            commandStatus.addRow(commandName, '✗')
            throw new Error(`File ${commandPath} must have a command description.`)
        }

        try {
            command.data = command.data.toJSON();
        } catch (error) {
            commandStatus.addRow(commandName, '✗')
            throw new Error(`Failed to turn ${commandPath} into JSON.`)
        }

        client.commands.set(commandName, command)

        commandStatus.addRow(commandName, '✓')
    }, '.js')

    if (includeTable && commandStatus.toJSON().rows.length > 0) {
        console.log(commandStatus.toString())
    }
}

export async function getAppCommands(client, guildId) {
    let applicationCommands

    if (guildId) {
        const guild = await client.guilds.fetch(guildId)
        applicationCommands = guild.commands
    } else {
        applicationCommands = await client.application.commands
    }

    await applicationCommands.fetch()
    return applicationCommands
}

export async function registerCommands(client, localCommands, guild) {
    const applicationCommands = await getAppCommands(client, guild)

    for (const localCmd of localCommands) {
        let localCommand = localCmd[1]
        const {
            name,
            name_localizations,
            description,
            description_localizations,
            default_member_permissions,
            dm_permission,
            options,
        } = localCommand.data

        const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name)

        if (existingCommand) {
            if (localCommand.deleted) {
              await applicationCommands.delete(existingCommand.id);
              console.log(`${chalk.red('[DELETE]')} Deleted ${guild ? 'guild' : 'global'} command "${name}".`);
              continue;
            }
      
            if (areCommandsDifferent(existingCommand, localCommand)) {
              await applicationCommands.edit(existingCommand.id, {
                description,
                options,
              });

              console.log(`${chalk.cyan('[EDIT]')} Edited ${guild ? 'guild' : 'global'} command "${name}".`);
            }
          } else {
            if (localCommand.deleted) {
              console.log(`${chalk.blue('[SKIP]')} Skipping registering ${guild ? 'guild' : 'global'} command "${name}" as it's set to delete.`);
              continue
            }
      
            await applicationCommands.create({
              name,
              name_localizations,
              description,
              description_localizations,
              default_member_permissions,
              dm_permission,
              options,
            });
      
            console.log(`${chalk.green('[ADD]')} Registered ${guild ? 'guild' : 'global'} command "${name}".`);
          }
    }

}

export async function handleCommands(client, models) {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return

        //await interaction.deferReply()

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

            /*if (client.validations.size !== 0) {
                let canRun = true

                await client.validations.every(async (validation) => {
                    console.log(validation(interaction))
                    const cantRunCommand = await validation(interaction, command, client, models)

                    if (cantRunCommand) {
                        canRun = false
                        return false
                    }

                    return true
                })

                if (canRun) {
                    await command.run(interaction, client, models)
                }
            } else {
                await command.run(interaction, client, models)
            }*/
        } else {
            interaction.reply({ content: 'Command not found.', ephemeral: true })
        }
    })
}