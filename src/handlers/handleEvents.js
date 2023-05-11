import { getFolderPaths, getFilePaths, getFileName } from '../utils/fileUtils.js'
import AsciiTable from 'ascii-table'

export function initializeEvents(client, eventsPath, includeTable = false, models) {
    let eventStatus = new AsciiTable().setHeading('Event', 'Status')

    const eventPaths = getFolderPaths(eventsPath, false)

    for (const eventPath of eventPaths) {
        const eventName = getFileName(eventPath)
        const eventFuncPaths = getFilePaths(eventPath, true)
        eventFuncPaths.sort()

        if (!eventName) {
            eventStatus.addRow(eventName, '✗')
            continue
        }

        client.on(eventName, async (...arg) => {
            for (const eventFuncPath of eventFuncPaths) {
                const { default: eventFunc } = await import(eventFuncPath)
                const cantRunEvent = await eventFunc(...arg, client, models)
                if (cantRunEvent) break
            }
        })
        
        eventStatus.addRow(eventName, '✓') // ✅ ✓ ❌ ✗
    }

    if (includeTable && eventStatus.toJSON().rows.length > 0) {
        console.log(eventStatus.toString())
    }
}