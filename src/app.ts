import express from 'express'
import dotenv from 'dotenv'
import pdfRouter from './routes/pdfRouter'

dotenv.config()

const app = express()
const Port = process.env.PORT || 3000

// initialize db
import { initializeDb } from './db'
import chalk from 'chalk'
// nice title in awcii art
const rainbowColors = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0000FF',
  '#4B0082',
  '#8B00FF',
]
const text = 'Hello from PDF Streamer'
let coloredText = ''

for (let i = 0; i < text.length; i++) {
  const color = rainbowColors[i % rainbowColors.length]
  coloredText += chalk.bold.hex(color)(text[i])
}
console.log()
console.log(coloredText)
console.log()
console.log(chalk.bold('Starting server...'))
// print out safe variables
console.log(
  '  process.env.PDF_BASE_DIR:',
  chalk.bold.green(process.env.PDF_BASE_DIR)
)
console.log(
  '  process.env.BUILD_DATE:',
  chalk.bold.green(process.env.BUILD_DATE)
)
console.log(
  '  process.env.COMMIT_HASH:',
  chalk.bold.green(process.env.COMMIT_HASH)
)
console.log('  process.env.VERSION:', chalk.bold.green(process.env.VERSION))

initializeDb()
// Use the PDF route
app.use('/pdf', pdfRouter)
app.use('/', (_req, res) => {
  res.send({
    buildDate: process.env.BUILD_DATE || 'N/A',
    commitHash: process.env.COMMIT_HASH || 'N/A',
    version: process.env.VERSION || 'N/A',
  })
})
// Start the server
app.listen(Port, () => {
  console.log(
    chalk.bold('Server is running on port'),
    chalk.bold.hex('#FFA500')(Port)
  )
})
