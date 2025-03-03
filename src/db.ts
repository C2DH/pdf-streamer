import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import Database from 'better-sqlite3'

const PdfStoragePath = process.env.PDF_BASE_DIR || './data'
const PdfSqlitePath = process.env.PDF_SQLITE_PATH || './pdfs.db'
const options =
  process.env.NODE_ENV === 'development'
    ? {
        verbose: console.log,
      }
    : {}

const db = new Database(PdfSqlitePath, options)
db.pragma('journal_mode = WAL')

if (
  !fs.existsSync(PdfStoragePath) ||
  !fs.lstatSync(PdfStoragePath).isDirectory()
) {
  console.error(
    chalk.red(
      `The path ${PdfStoragePath} does not exist or is not a directory.`
    )
  )
  process.exit(1)
}

// Create table if it doesn’t exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS files (
    projectId TEXT,
    fileName TEXT,
    filePath TEXT,
    PRIMARY KEY (projectId, fileName)
  )
`
).run()

export const initializeDb = () => {
  console.log()
  console.log(chalk.bold('Initializing database...'))

  console.log('  process.env.PDF_SQLITE_PATH:', chalk.bold.green(PdfSqlitePath))
  console.log('  process.env.PDF_BASE_DIR:', chalk.bold.green(PdfStoragePath))
  db.prepare(
    `
  DELETE FROM files
    `
  ).run() // Clear old entries
  console.log('  scanning storage directory:', chalk.bold.green(PdfStoragePath))
  const projects = fs.readdirSync(PdfStoragePath)
  let countProjects = 0
  let countFiles = 0
  for (const projectId of projects) {
    const projectPath = path.join(PdfStoragePath, projectId)
    if (fs.lstatSync(projectPath).isDirectory()) {
      console.log('  checking projectPath:', chalk.bold.blue(projectPath))
      countProjects += 1
      const files = fs.readdirSync(projectPath)
      for (const fileName of files) {
        console.log(
          '  - adding gile:',
          chalk.bold(`${projectPath}/${fileName}`)
        )
        if (fileName.endsWith('.pdf')) {
          const filePath = path.join(projectPath, fileName)
          db.prepare(
            `
              INSERT INTO files (projectId, fileName, filePath) VALUES (?, ?, ?)
            `
          ).run(projectId, fileName, filePath)
          countFiles += 1
        }
      }
    }
  }
  console.log(
    '\n  Added',
    chalk.bold.green(countFiles),
    'files to',
    chalk.bold.green(countProjects),
    'projects.'
  )
  console.log('  Database initialized at:', chalk.bold.green(PdfSqlitePath))
  console.log()
}

export const findFile = (projectId: string, fileName: string) => {
  return db
    .prepare(
      `
  SELECT filePath FROM files WHERE projectId = ? AND fileName = ?
`
    )
    .get(projectId, fileName)
}

/**
 * Retrieves a list of files from the database with pagination.
 *
 * @param {Object} [pagination={ offset: 0, limit: 10 }] - The pagination options.
 * @param {number} pagination.offset - The number of records to skip.
 * @param {number} pagination.limit - The maximum number of records to return.
 * @returns {Array} The list of files with their projectId and fileName.
 *
 * @example
 * // Retrieve the first 10 files
 * const files = listFiles();
 *
 * @example
 * // Retrieve 10 files starting from the 20th record
 * const files = listFiles({ offset: 20, limit: 10 });
 */
export const listFiles = (
  { offset, limit }: { offset: number; limit: number } = {
    offset: 0,
    limit: 10,
  }
): Array<{ projectId: string; fileName: string }> => {
  return db
    .prepare(
      `
  SELECT projectId, fileName FROM files LIMIT ? OFFSET ?
`
    )
    .all(limit, offset) as Array<{ projectId: string; fileName: string }>
}
