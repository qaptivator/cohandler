import { foreachDir } from "./fileUtils"
import AsciiTable from 'ascii-table'

export function initializeCommands(client, commandsPath, includeTable = false) {
    let commandStatus = new AsciiTable().setHeading('Command', 'Status')

    foreachDir(commandsPath, (commandPath) => {
        let command = import(commandPath)
        let commandName = command.data.name

        if (!command.data) {
            commandStatus.addRow(commandName, '❌')
            throw new Error(`File ${commandPath} must export "data".`)
        }

        if (!command.run) {
            commandStatus.addRow(commandName, '❌')
            throw new Error(`File ${commandPath} must export a "run" function.`)
        }

        if (!commandName) {
            commandStatus.addRow(commandName, '❌')
            throw new Error(`File ${commandPath} must have a command name.`)
        }

        if (!command.data.description) {
            commandStatus.addRow(commandName, '❌')
            throw new Error(`File ${commandPath} must have a command description.`)
        }

        try {
            command.data = command.data.toJSON();
        } catch (error) {
            commandStatus.addRow(commandName, '❌')
            throw new Error(`Failed to turn ${commandPath} into JSON.`)
        }

        client.commands.set(commandName, command)

        commandStatus.addRow(commandName, '✅')
    }, '.js')

    if (includeTable) {
        console.log(commandStatus.toString())
    }
}