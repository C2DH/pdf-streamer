import express from 'express'
import dotenv from 'dotenv'
import pdfRouter from './routes/pdfRouter'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Use the PDF route
app.use('/pdf', pdfRouter)

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
