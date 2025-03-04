# PDF Streamer

PDF Streamer is a PDF Server with Partial Content Support completely written by AI. It is a lightweight Node.js server implemented in TypeScript to serve PDF files with support for partial content delivery (byte-range requests). Designed for scalable production and efficient development workflows, with Docker support.

---

## Features

- **Partial Content Support**: Enables serving large PDF files with byte-range requests.
- **Development Mode Utilities**: Includes routes for listing files in a directory (restricted to development mode).
- **Environment Configuration**: Supports `.env` for easy configuration of paths and server settings.
- **Dockerized**: Production-ready Docker and development-friendly Docker Compose setup.
- **TypeScript**: Strongly typed for maintainability and scalability.

---

## Project Structure

```plaintext
project/
├── .env                  # Environment variables file
├── Dockerfile            # Dockerfile to build the image
├── docker-compose.yml    # Optional for multi-container setup
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── app.ts            # Main Express app
│   ├── routes/
│   │   └── pdfRouter.ts  # PDF route logic
│   └── utils/
│       └── fileUtils.ts  # Helper functions for file operations
└── projects/             # Directory containing project files (e.g., PDFs)
```

## Installation

Clone the repository:

```bash
git clone https://github.com/C2DH/pdf-streamer.git
cd pdf-streamer
```

Install dependencies:

```
npm install
```

Create a .env file in the root directory with the following:

```bash
PDF_BASE_DIR=./data
PORT=3000
NODE_ENV=production
```

Ensure the projects folder exists and contains your PDF files.
Use `NODE_ENV=development` for development use.

```bash
npm run dev
```

## Test docker image

```bash
docker compose up --build
```

## API Endpoints

| Method | Endpoint                  | Description                                                                       |
| ------ | ------------------------- | --------------------------------------------------------------------------------- |
| GET    | /pdf/:projectId/:fileName | Serve a specific PDF file.                                                        |
| GET    | /pdf/                     | List all projects and all files in the directory (NODE_ENV=development **only**). |

## Environment Variables

| Variable     | Description                                           | Default    |
| ------------ | ----------------------------------------------------- | ---------- |
| PORT         | The port on which the server runs.                    | 3000       |
| PDF_BASE_DIR | Path to the folder containing project files.          | ./data     |
| NODE_ENV     | Set the environment mode (development or production). | production |
