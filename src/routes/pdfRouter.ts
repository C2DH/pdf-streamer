import { Router, Request, Response } from 'express'
import fs from 'fs'
import { countAllFiles, getFile, listFiles } from '../db'

const router = Router()

// Middleware to restrict access to development mode
// const checkDevMode = (req: Request, res: Response, next: Function) => {
//   if (process.env.NODE_ENV !== 'development') {
//     res
//       .status(403)
//       .json({ error: 'This route is only available in development mode.' })
//     return
//   }
//   next()
// }

// Route to list all filenames in the folder
router.get('/', (req: Request, res: Response) => {
  const projectBaseDir = process.env.PDF_BASE_DIR
  const projectBaseUrl = process.env.BASE_URL || 'http://localhost:3000'
  if (!projectBaseDir) {
    res.status(500).json({ error: 'PDF_BASE_DIR is not set.' })
    return
  }
  const offset = parseInt(req.query.offset as string, 10) || 0
  const limit = parseInt(req.query.limit as string, 10) || 10

  try {
    const records = listFiles({
      offset,
      limit,
    }).map((record) => ({
      name: record.fileName,

      url: `${projectBaseUrl}/pdf/${record.projectId}/${record.fileName}`,
    }))
    const total = countAllFiles()
    res.json({
      data: records,
      offset,
      limit,
      total,
    })
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

  const file = getFile(projectId, fileName)
  if (!file) {
    res.status(404).send('File not found')
    return
  }
  const filePath = file.filePath
  console.log('filePath:', filePath)
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
