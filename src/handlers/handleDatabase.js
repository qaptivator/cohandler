import { foreachDir } from '../utils/fileUtils.js'
import AsciiTable from 'ascii-table'

export async function initializeDatabase(client, modelsPath, includeTable = false) {
    client.models.clear()
    
    let modelStatus = new AsciiTable().setHeading('Model', 'Status')

    await foreachDir(modelsPath, async (modelPath) => {
        let { model, modelName } = await import(modelPath)

        if (!model || !modelName) {
            modelStatus.addRow(modelName, '✗')
            return
        }

        client.models.set(modelName, model)

        modelStatus.addRow(modelName, '✓')
    }, '.js')

    if (includeTable && modelStatus.toJSON().rows.length > 0) {
        console.log(modelStatus.toString())
    }
}