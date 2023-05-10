import { getFilePaths } from "./fileUtils";

export function buildCommandTree(directory) {
    let commandTree = { slash: [], user: [], message: [] }

    if (!directory) return commandTree

    const commandFilePaths = getFilePaths(directory, true)

    for (const commandFilePath of commandFilePaths) {
        let { data, run, deleted, ...rest } = import(commandFilePath)

        if (!data) throw new Error(`File ${commandFilePath} must export "data".`);
        if (!run) throw new Error(`File ${commandFilePath} must export a "run" function.`);
        if (!data.name) throw new Error(`File ${commandFilePath} must have a command name.`);
        if (!data.description) throw new Error(`File ${commandFilePath} must have a command description.`);

        try {
            data = data.toJSON();
        } catch (error) {}

        commandTree.push({
            ...data,
            ...rest,
            deleted,
            run,
        });
    }

    return commandTree
}