import express from 'express'
import dotenv from 'dotenv'
import pdfRouter from './routes/pdfRouter'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// initialize db
import { initializeDb } from './db'
import chalk from 'chalk'
initializeDb()
// Use the PDF route
app.use('/pdf', pdfRouter)

// Start the server
app.listen(PORT, () => {
  console.log(
    chalk.bold('Server is running on port'),
    chalk.bold.hex('#FFA500')(PORT)
  )
})
