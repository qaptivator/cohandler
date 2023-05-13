import { getFolderPaths, getFilePaths, getFileName } from '../utils/fileUtils.js'
import { initTable, addSuccess, addFail, logTable } from '../utils/tableUtils.js'

export function initializeEvents(client, eventsPath, includeTable = false, models) {
    let eventStatus = initTable('Event', 'Status')

    const eventPaths = getFolderPaths(eventsPath, false)

    for (const eventPath of eventPaths) {
        const eventName = getFileName(eventPath)
        const eventFuncPaths = getFilePaths(eventPath, true)
        eventFuncPaths.sort()

        if (!eventName) {
            addFail(eventStatus, eventName)
            continue
        }

        client.on(eventName, async (...arg) => {
            for (const eventFuncPath of eventFuncPaths) {
                const { default: eventFunc } = await import(eventFuncPath)
                const cantRunEvent = await eventFunc(...arg, client, models)
                if (cantRunEvent) break
            }
        })
        
        addSuccess(eventStatus, eventName)
    }

    logTable(eventStatus, includeTable)
}