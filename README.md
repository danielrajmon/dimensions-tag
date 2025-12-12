# Dimensions Tag Generator

A tool to generate NFC tag data for LEGO Dimensions characters and vehicles.

## Features

- Generate tag data for 77 characters and 64 vehicles
- NFC tag UID encryption using TEA algorithm
- Password generation for write protection
- Web-based interface with dropdown selection
- Character and vehicle images
- Dark theme UI

## Deployment

### Docker

Build the image:
```bash
npm run docker:buildamd64  # For x86_64
npm run docker:build      # For local arch
```

Run the container:
```bash
npm run docker:run
```

Stop the container:
```bash
npm run docker:stop
```

Publish to Docker Hub:
```bash
export DOCKER_USERNAME=yourusername
npm run docker:publish
```

### Local Development

Start backend and frontend:
```bash
npm run start
```

- Backend: http://localhost:3000
- Frontend: http://localhost:8080

## Project Structure

- `backend/` - Express.js API server
  - `src/` - TypeScript source files
  - `data/` - Character and vehicle JSON data
- `frontend/` - Static HTML/CSS/JS interface
- `Dockerfile` - Docker build configuration

## Environment Variables

None. The container runs on port 80 by default.

## Requirements

- Node.js 20+
- Docker (for containerized deployment)
