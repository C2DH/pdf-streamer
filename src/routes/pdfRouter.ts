import { Router, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { getFilePath } from '../utils/fileUtils'

const router = Router()

// Middleware to restrict access to development mode
const checkDevMode = (req: Request, res: Response, next: Function) => {
  if (process.env.NODE_ENV !== 'development') {
    res
      .status(403)
      .json({ error: 'This route is only available in development mode.' })
    return
  }
  next()
}

// Route to list all filenames in the folder
router.get('/', checkDevMode, (req: Request, res: Response) => {
  const projectBaseDir = process.env.PDF_BASE_DIR
  if (!projectBaseDir) {
    res.status(500).json({ error: 'PDF_BASE_DIR is not set.' })
    return
  }
  try {
    const projects = fs
      .readdirSync(projectBaseDir)
      .filter((file) =>
        fs.statSync(path.join(projectBaseDir, file)).isDirectory()
      )
      .map((project) => {
        const files = fs
          .readdirSync(path.join(projectBaseDir, project))
          .filter((file) => file.endsWith('.pdf'))
          .map((file) => ({ name: file, url: `/pdf/${project}/${file}` }))
        return { project, files }
      })
    res.status(200).json({ projects })
  } catch (err) {
    console.error('Error reading directory:', err)
    res.status(500).json({ error: 'Failed to read the directory.' })
  }
})

router.get('/:projectId/:fileName', (req: Request, res: Response): void => {
  const projectBaseDir = process.env.PDF_BASE_DIR
  if (!projectBaseDir) {
    res.status(500).json({ error: 'PDF_BASE_DIR is not set.' })
    return
  }
  const { projectId, fileName } = req.params

  /**
   * Constructs the full file path for a given project and file name.
   *
   * @param {string} projectBaseDir - The base directory of the project.
   * @param {string} projectId - The unique identifier of the project.
   * @param {string} fileName - The name of the file.
   * @returns {string} The full file path.
   */
  const filePath = getFilePath(projectBaseDir, projectId, fileName)

  if (!fs.existsSync(filePath)) {
    res.status(404).send('File not found')
    return
  }

  const fileSize = fs.statSync(filePath).size
  const range = req.headers.range

  if (!range) {
    // Full file request
    res.setHeader('Content-Length', fileSize.toString())
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Accept-Ranges', 'bytes')
    fs.createReadStream(filePath).pipe(res)
  } else {
    // Partial file request
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    if (start >= fileSize || end >= fileSize || start > end) {
      res
        .status(416)
        .set('Content-Range', `bytes */${fileSize}`)
        .send('Requested range not satisfiable')
      return
    }

    const chunkSize = end - start + 1
    const fileStream = fs.createReadStream(filePath, { start, end })

    res.status(206).set({
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize.toString(),
      'Content-Type': 'application/pdf',
    })

    fileStream.pipe(res)
  }
})

export default router
