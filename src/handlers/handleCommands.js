import { foreachDir } from "../utils/fileUtils.js"
import { areCommandsDifferent } from "../utils/areCommandsDifferent.js"
import { initTable, addSuccess, addFail, logTable } from '../utils/tableUtils.js'
import chalk from 'chalk'

export async function initializeCommands(client, commandsPath, includeTable = false) {
    client.commands.clear()

    let commandStatus = initTable('Command', 'Status')

    await foreachDir(commandsPath, async (commandPath) => {
        let { default: command } = await import(commandPath)
        let commandName = command.data.name ?? 'n/a'

        if (!command.data) {
            addFail(commandStatus, commandName)
            throw new Error(`File ${commandPath} must export "data".`)
        }

        if (!command.run) {
            addFail(commandStatus, commandName)
            throw new Error(`File ${commandPath} must export a "run" function.`)
        }

        if (!commandName) {
            addFail(commandStatus, commandName)
            throw new Error(`File ${commandPath} must have a command name.`)
        }

        if (!command.data.description) {
            addFail(commandStatus, commandName)
            throw new Error(`File ${commandPath} must have a command description.`)
        }

        try {
            command.data = command.data.toJSON();
        } catch (error) {
            addFail(commandStatus, commandName)
            throw new Error(`Failed to turn ${commandPath} into JSON.`)
        }

        client.commands.set(commandName, command)

        addSuccess(commandStatus, commandName)
    })

    logTable(commandStatus, includeTable)
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

export async function registerCommands(client, localCommands, guild, includeCommandStatuses = true) {
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
              if (includeCommandStatuses) console.log(`${chalk.red('[DELETE]')} Deleted ${guild ? 'guild' : 'global'} command "${name}".`);
              continue
            }
      
            if (areCommandsDifferent(existingCommand, localCommand)) {
              await applicationCommands.edit(existingCommand.id, {
                description,
                options,
              });

               if (includeCommandStatuses) console.log(`${chalk.cyan('[EDIT]')} Edited ${guild ? 'guild' : 'global'} command "${name}".`)
            }
          } else {
            if (localCommand.deleted) {
                if (includeCommandStatuses) console.log(`${chalk.blue('[SKIP]')} Skipping registering ${guild ? 'guild' : 'global'} command "${name}" as it's set to delete.`);
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
      
            if (includeCommandStatuses) console.log(`${chalk.green('[ADD]')} Registered ${guild ? 'guild' : 'global'} command "${name}".`);
          }
    }

}