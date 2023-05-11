import { foreachDir } from '../utils/fileUtils.js'
import AsciiTable from 'ascii-table'

export function initializeValidations(client, validationsPath, includeTable = false) {
    let validationStatus = new AsciiTable().setHeading('Validation', 'Status')

    foreachDir(validationsPath, (validationPath, validationName) => {
        let validationFunc = import(validationPath)

        if (typeof validationFunc !== 'function') {
            validationStatus.addRow(validationName, '❌')
            throw new Error(`Validation file ${validationPath} must export a function by default.`)
        }

        client.validations.set(validationName, validationFunc)

        validationStatus.addRow(validationName, '✅')
    }, '.js')

    if (includeTable) {
        console.log(validationStatus.toString())
    }
}