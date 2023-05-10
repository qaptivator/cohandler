import path from 'path'
import fs from 'fs'

/**
 * Get every file's path inside directory.
 * @param {string} directory Directory's path.
 * @param {boolean} deep Should it retreive nested files?
 * @param {string} extension File extension to filter out paths.
 * @returns {Array} Array of paths.
*/
export function getFilePaths(directory, deep = false, extension) {
    let filePaths = []
    if (!directory) return []

    const files = fs.readdirSync(directory, { withFileTypes: true })

    if (extension) files.filter((file) => file.endsWith(extension))

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

/**
 * Get every folder's path inside directory.
 * @param {string} directory Directory's path.
 * @param {boolean} deep Should it retreive nested folders?
 * @returns {Array} Array of paths.
*/
export function getFolderPaths(directory, deep = false) {
    let folderPaths = []
    if (!directory) return []
  
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

/**
 * Get file name through its path.
 * @param {string} stringPath File's path.
 * @returns {string} File's name.
*/
export function getFileName(stringPath) {
  if (!stringPath) return ''
  return stringPath.replace(/\\/g, '/').split('/').pop()
}

/**
 * Loop through directory.
 * To use keyword "continue", replace it wih "return".
 * To use keyword "break", return true.
 * @param {string} directory Directory's path.
 * @param {Function} callback Callback after each iteration.
*/
export async function foreachDir(directory, callback, extension) {
  if (!directory && !callback) return

  const filesPaths = getFilePaths(directory, true, extension)
  filesPaths.sort()

  for (const filePath of filesPaths) {
    const result = await callback(filePath, getFileName(filePath))
    
    if (result === true) {
      break
    } else if (result === false) {
      continue
    }
  }
}
