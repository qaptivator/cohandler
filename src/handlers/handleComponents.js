import { foreachDir, getFolderPaths, getFileName } from "../utils/fileUtils.js"
import AsciiTable from 'ascii-table'

export async function initializeComponents(client, componentsPath, includeTable = false) {
    await client.buttons.clear()
    await client.selectMenus.clear()
    await client.modals.clear()

    const validFolders = [
        'buttons',
        'selectMenus',
        'modals'
    ]

    let componentStatus = new AsciiTable().setHeading('Group', 'Component', 'Status')

    const componentFolders = getFolderPaths(componentsPath, false)

    for (const componentFolder of componentFolders) {
        const componentGroupName = getFileName(componentFolder)
        const isValidFolder = validFolders.find(el => el === componentGroupName)
        if (!isValidFolder) continue

        await foreachDir(componentFolder, async (componentPath) => {
            const { default: component } = await import(componentPath)
            const { data, run } = component

            if (!data) {
                componentStatus.addRow(componentGroupName, 'N/A', '✗')
                throw new Error(`File ${componentPath} must export "data".`)
            }

            const { name } = data

            if (!name) {
                componentStatus.addRow(componentGroupName, 'N/A', '✗')
                throw new Error(`File ${componentPath} must have a component name.`)
            }
        
            if (!run) {
                componentStatus.addRow(componentGroupName, name, '✗')
                throw new Error(`File ${componentPath} must export a "run" function.`)
            }

            client[componentGroupName].set(name, component)
        })

        /*let success = false
        const isValidFolder = validFolders.find(el => el === componentName)
        if (!isValidFolder) continue

        await foreachDir(componentFolder, async (componentPath) => {
            const { default: component } = await import(componentPath)

            validComponent(component, componentPath, componentStatus)

            client.buttons.set(button.data.name, button)
        })

        switch(componentName) {
            case 'buttons':

                await foreachDir(componentFolder, async (buttonPath) => {
                    const { default: button } = await import(buttonPath)
                    validComponent(button, buttonPath, componentStatus)
                    client.buttons.set(button.data.name, button)
                })

                success = true
                break
            case 'selectMenus':

                await foreachDir(componentFolder, async (selectMenuPath) => {
                    const { default: selectMenu } = await import(selectMenuPath)
                    client.selectMenus.set(selectMenu.data.name, selectMenu)
                })

                success = true
                break
            case 'modals':

                await foreachDir(componentFolder, async (modalPath) => {
                    const { default: modal } = await import(modalPath)
                    client.modals.set(modal.data.name, modal)
                })

                success = true
                break
            default:
                success = false
                break
        }

        if (success === true) {
            componentStatus.addRow(componentName, '✓')
        } else {
            componentStatus.addRow(componentName, '✗')
        }*/
    }

    if (includeTable && componentStatus.toJSON().rows.length > 0) {
        console.log(componentStatus.toString())
    }
}