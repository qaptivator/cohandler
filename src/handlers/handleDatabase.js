import { foreachDir } from '../utils/fileUtils.js'
import { initTable, addSuccess, addFail, logTable } from '../utils/tableUtils.js'

export async function initializeDatabase(client, modelsPath, includeTable = false) {
    client.models.clear()
    
    let modelStatus = initTable('Model', 'Status')

    await foreachDir(modelsPath, async (modelPath) => {
        let { model, modelName } = await import(modelPath)

        if (!model || !modelName) {
            addFail(modelStatus, modelName)
            return
        }

        client.models.set(modelName, model)

        addSuccess(modelStatus, modelName)
    })

    logTable(modelStatus, includeTable)
}