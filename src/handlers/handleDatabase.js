import { foreachDir } from '../utils/fileUtils.js'
import AsciiTable from 'ascii-table'

export function initializeDatabase(client, modelsPath, includeTable = false) {
    let modelStatus = new AsciiTable().setHeading('Model', 'Status')

    foreachDir(modelsPath, (modelPath, modelName) => {
        let { model, modelName } = import(modelPath)

        if (!model || !modelName) {
            modelStatus.addRow(modelName, '❌')
            return
        }

        client.models.set(modelName, model)

        modelStatus.addRow(modelName, '✅')
    }, '.js')

    if (includeTable) {
        console.log(modelStatus.toString())
    }
}