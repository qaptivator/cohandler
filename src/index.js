import { Collection } from '@discordjs/collection'
import { joinDirPath } from './utils/dirUtils.js'

import { initializeEvents } from './handlers/handleEvents.js'
import { initializeDatabase } from './handlers/handleDatabase.js'
import { initializeComponents } from './handlers/handleComponents.js'
import { registerCommands, initializeCommands } from './handlers/handleCommands.js'
import { handleInteractions } from './handlers/handleInteractions.js'

export class Cohandler {
    /**
     * Initialize the Cohandler.
     *
     * @example
     * let handler = new Cohandler(
     *      client, 
     *      null, 
     *      { 
     *          commandsPath: dirPathBuilder("/commands", import.meta.url)
     *      }
     * );
     * 
     * @param {Client} client Discord.js Client.
     * @param {mongoose} mongoose Mongoose class after connection to database.
     * @param {object} directories Path of directories for the handler.
     * @param {object} options Cohandler options.
    */
    constructor(
        client,
        mongoose,
        {
            commandsPath, 
            eventsPath,
            modelsPath,
            componentsPath,
        },
        {
            testGuild,
            includeTable,
            includeCommandStatuses
        }
    ) {
	    if (!client) throw new Error('Property "client" is required when instantiating Cohandler.')

        // main params
        this._client = client
        this._mongoose = mongoose

        // directories params
        this._commandsPath = commandsPath
        this._eventsPath = eventsPath
        this._modelsPath = modelsPath
        this._componentsPath = componentsPath

        // options params
        this._testGuild = testGuild
        this._includeTable = includeTable
        this._includeCommandStatuses = includeCommandStatuses

        // collections
        this._client.commands = new Collection()
        this._client.buttons = new Collection()
        this._client.selectMenus = new Collection()
        this._client.modals = new Collection()
        this._client.models = new Collection()

        if (this._mongoose && !this._modelsPath) {
            throw new Error(
                'Database cannot be initialized without models path. Either add "modelsPath" or remove "mongoose"'
            )
        }

        if (!this._mongoose && this._modelsPath) {
            throw new Error(
                'Database cannot be initialized without mongoose object. Either add "mongoose" or remove "modelsPath"'
            )
        }

        if (!this._commandsPath && this._componentsPath) {
            throw new Error(
                'Components cannot be initialized without "commandsPath" defined. Either add "commandsPath" or remove "componentsPath"'
            )
        }
        
        if (this._modelsPath && this._mongoose) {
            initializeDatabase(this._client, this._modelsPath, this._includeTable)
        }

        if (this._eventsPath) {
            initializeEvents(this._client, this._eventsPath, this._includeTable, this._client.models)
        }

        if (this._componentsPath) {
            initializeComponents(this._client, this._componentsPath, this._includeTable)
        }

        if (this._commandsPath) {
            initializeCommands(this._client, this._commandsPath, this._includeTable)

            this._client.once('ready', () => {
                registerCommands(this._client, this._client.commands, this._testGuild, this._includeCommandStatuses)
                handleInteractions(this._client, this._client.models)
            })
        }

        // every directory pakcage uses
        // commands
        // events
        // models
        // components
        //    buttons
        //    selectMenus
        //    modals

        // [initialize chain]
        // launch sharding (only for massive servers)
        // init client -- done
        // connect to db -- done
        // init events -- done
        // init slash commands -- done
        // init user and message commands
        // init components (buttons, menus, modals)
        // init validations -- done
        // register slash commands
        // login
	}

    get commands() {
        return this._client.commands;
    }

    get validations() {
        return this._client.validations;
    }

    get models() {
        return this._client.models;
    }

    get modals() {
        return this._client.modals;
    }

    get selectMenus() {
        return this._client.selectMenus;
    }

    get buttons() {
        return this._client.buttons;
    }
}

/**
 * Builds a directory path from string.
 * It will attach path you provided to the path of current file's directory.
 *
 * @example
 * // Current directorty: /home/bot
 * dirPathBuilder("/commands", import.meta.url);
 * // Output path: /home/bot/commands
 * 
 * @param {string} dirPath Path to file or directory to be attached.
 * @param {string} importMetaUrl Current file's directory (import.meta.url).
 * @returns {string} New path to file or directory.
*/
export function dirPathBuilder(dirPath, importMetaUrl) {
    return joinDirPath(dirPath, importMetaUrl)
}