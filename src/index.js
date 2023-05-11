import { Collection } from '@discordjs/collection'
import { initializeEvents } from './handlers/handleEvents.js'
import { initializeDatabase } from './handlers/handleDatabase.js'
import { initializeValidations } from './handlers/handleValidations.js'
import { registerCommands, handleCommands, initializeCommands } from './handlers/handleCommands.js'
import { joinDirPath } from './utils/dirUtils.js'

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
     * @param {Client} client Discord.js Client
     * @param {mongoose} mongoose Mongoose class after connection to database
     * @param {object} directories Path of directories for the handler
     * @param {object} options Cohandler options
    */
    constructor(
        client,
        mongoose,
        {
            commandsPath, 
            eventsPath,
            validationsPath,
            modelsPath
        },
        {
            testGuild,
            includeTable
        }
    ) {
	    if (!client) throw new Error('Property "client" is required when instantiating Cohandler.')

        // main params
        this._client = client
        this._mongoose = mongoose

        // directories params
        this._commandsPath = commandsPath
        this._eventsPath = eventsPath
        this._validationsPath = validationsPath
        this._modelsPath = modelsPath

        // options params
        this._testGuild = testGuild
        this._includeTable = includeTable

        // collections
        this._client.commands = new Collection() // done
        this._client.validations = new Collection() // done
        this._client.buttons = new Collection()
        this._client.selectMenus = new Collection()
        this._client.modals = new Collection()
        this._client.models = new Collection() // done

        if (this._validationsPath && !this._commandsPath) {
            throw new Error(
                'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "validationsPath"'
            )
        }

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
        
        if (this._modelsPath && this._mongoose) {
            console.log('init db')
            initializeDatabase(this._client, this._modelsPath, this._includeTable)
        }

        if (this._eventsPath) {
            console.log('init events')
            initializeEvents(this._client, this._eventsPath, this._includeTable, this._models)
        }

        if (this._commandsPath) {
            console.log('init commands')
            initializeCommands(this._client, this._commandsPath, this._includeTable)

            this._client.once('ready', () => {
                console.log('register commands')
                registerCommands(this._client, this._client.commands, this._testGuild)

                if (this._validationsPath) {
                    console.log('init validations')
                    initializeValidations(this._client, this._validationsPath, this._includeTable)
                }

                console.log('handle commands')
                handleCommands(this._client, this._client.models)
            });
        }

        // every directory pakcage uses
        // commands
        // events
        // validations
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