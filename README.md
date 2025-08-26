# Galaxy AI

Welcome to the documentation for Galaxy AI, a powerful and feature-rich ChatGPT clone. This document provides a comprehensive overview of the project, from its architecture to its features and setup instructions.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Codebase Structure](#codebase-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Features

- **Conversational AI:** Engage in natural and dynamic conversations with the AI.
- **File Uploads:** Upload files to the AI for analysis and discussion.
- **Memory Management:** A hybrid approach to conversation memory using both `mem0.ai` and MongoDB.
- **User Authentication:** Secure user authentication and management with Clerk.
- **Responsive UI:** A clean and modern user interface built with Next.js and Tailwind CSS.

## Architecture

The application is a full-stack Next.js project, encompassing both the frontend and backend within a single codebase. This unified structure simplifies development and deployment.

- **Frontend:** The user interface is built with React and Next.js, providing a dynamic and responsive experience. It handles user interactions, renders the chat interface, and communicates with the backend API.

- **Backend:** The backend is implemented using Next.js API Routes. It follows a controller-service-repository pattern to ensure a modular and scalable architecture.
  - **API Routes:** Handle incoming HTTP requests, validate user input, and send responses.
  - **Services:** Contain the business logic of the application, such as processing user messages and interacting with the AI model.
  - **Repositories:** Abstract the data layer, providing a consistent interface for interacting with the database.

## Codebase Structure

The codebase is organized as follows:

- **`app/`:** Contains the main application logic, including pages and API routes.
  - **`app/api/`:** The backend of the application, with API endpoints for various features.
- **`components/`:** Reusable UI components used throughout the application.
- **`hooks/`:** Custom React hooks for managing state and side effects.
- **`lib/`:** Utility functions, libraries, and the core backend logic (services, repositories, etc.).
- **`public/`:** Static assets, such as images and fonts.
- **`styles/`:** Global styles and Tailwind CSS configuration.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/galaxy-ai.git
   ```

2. **Install dependencies:**

   ```bash
   cd galaxy-ai/frontend
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the `frontend` directory and add the following environment variables:

```
# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVnYWwtd2FsbGV5ZS0zMS5jbGVyay5hY2NvdW50cy5kZXYk
NEXT_PUBLIC_CLERK_SECRET_KEY=sk_test_Oy7uzKgzeJwbnG77VoLX6KnuMlzkbzWqHH9XLy74hP
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=1720a3b4756d85206dca
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dafyjxffa

# Backend
MONGO_URI=mongodb+srv://admin:admin@cluster0.carfrre.mongodb.net/
CLERK_SECRET_KEY=sk_test_Oy7uzKgzeJwbnG77VoLX6KnuMlzkbzWqHH9XLy74hP

CLERK_JWT_ISSUER=https://legal-walleye-31.clerk.accounts.dev
CLERK_JWKS_URL=https://legal-walleye-31.clerk.accounts.dev/.well-known/jwks.json
CLERK_JWT_TEMPLATE_NAME=ChatGPT

CLOUDINARY_CLOUD_NAME=dafyjxffa
CLOUDINARY_API_KEY=986862198312639
CLOUDINARY_API_SECRET=UURs4qqrj2N7cAwQPxHNjYBaKvo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default

UPLOADCARE_PUBLIC_KEY=1720a3b4756d85206dca
UPLOADCARE_SECRET_KEY=0627e9b27cd168ba7028

GEMINI_API_KEY=AIzaSyCelWGtAslBioJr3RCiIsN9YYvcl6UJTqg
MEM0_API_KEY=m0-NLPGWa2fFagw3Ohy8uk2F77dUJ4mt6BNH1V9gGFw
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyCelWGtAslBioJr3RCiIsN9YYvcl6UJTqg
NODE_ENV=development
```

### Running the Application

1. **Start the development server:**

   ```bash
   npm run dev
   ```

Open your browser and navigate to `http://localhost:3000` to see the application in action.

## API Documentation

For detailed information about the API, please refer to the [API Documentation](docs/API_Docs.md).

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you find a bug or have a feature request.