import AsciiTable from 'ascii-table'

// ✅ ✓ ❌ ✗

/**
 * Create a new ASCII table.
 * This extension only supports of adding one value to he table.
 * 
 * @param {string} headings Headings of table.
*/
export function initTable(...headings) {
    return new AsciiTable().setHeading(...headings)
}

/**
 * Adds a value to the provided table with check mark character as status.
 * 
 * @param {object} asciiTable ASCII Table Class.
 * @param {string} value Value to be added to the table.
*/
export function addSuccess(asciiTable, value) {
    asciiTable.addRow(value, '✓')
}

/**
 * Adds a value to the provided table with cross mark character as status.
 * 
 * @param {object} asciiTable ASCII Table Class.
 * @param {string} value Value to be added to the table.
*/
export function addFail(asciiTable, value) {
    asciiTable.addRow(value, '✗')
}

/**
 * Prints out the provided table. It will not print it out if it's empty.
 * 
 * @param {object} asciiTable ASCII Table Class.
 * @param {boolean} includeTable Should you print out the table?
*/
export function logTable(asciiTable, includeTable) {
    if (includeTable && asciiTable.toJSON().rows.length > 0) {
        console.log(asciiTable.toString())
    }
}