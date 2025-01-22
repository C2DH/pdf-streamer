import path from 'path'

/**
 * Constructs a file path by joining the base directory, project ID, and file name.
 *
 * @param {string} baseDir - The base directory path.
 * @param {string} projectId - The project identifier.
 * @param {string} fileName - The name of the file.
 * @returns {string} The constructed file path.
 */
export function getFilePath(
  baseDir: string,
  projectId: string,
  fileName: string
): string {
  return path.join(baseDir, projectId, fileName)
}
