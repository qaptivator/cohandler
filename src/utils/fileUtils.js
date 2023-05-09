import path from 'path'
import fs from 'fs'

export function getFilePaths(directory, deep = false) {
    let filePaths = []
    if (!directory) return []

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isFile()) {
            filePaths.push(filePath);
        }

        if (deep && file.isDirectory()) {
            filePaths = [...filePaths, ...getFilePaths(filePath, true)];
        }
    }
    
    return filePaths;
}

export function getFolderPaths(directory, deep = false) {
    let folderPaths = []
    if (!directory) return folderPaths
  
    const folders = fs.readdirSync(directory, { withFileTypes: true })
  
    for (const folder of folders) {
      const folderPath = path.join(directory, folder.name)
  
      if (folder.isDirectory()) {
        folderPaths.push(folderPath);
  
        if (deep) {
          folderPaths = [...folderPaths, ...getFolderPaths(folderPath, true)]
        }
      }
    }
  
    return folderPaths;
}

export function getFileName(stringPath) {
  if (!stringPath) return ''
  return stringPath.replace(/\\/g, '/').split('/').pop()
}

/**
 * Loop through directory.
 * To use keyword "continue", replace it wih "return".
 * @param {string} directory Directory's path
 * @param {functon} callback Callback after each iteration.
 * @param {functon} after Function to get called after the loop ends.
*/
export async function foreachDir(directory, callback, after) {
  if (!directory && !callback) return

  const filesPaths = getFilePaths(directory, true)
  filesPaths.sort()

  for (const filePath of filesPaths) {
    await callback(filePath, getFileName(filePath))
  }

  after()
}
