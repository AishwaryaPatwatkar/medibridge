# 🏥 MediBridge AI

**MediBridge AI** is a state-of-the-art, AI-powered medical report analysis platform designed to simplify complex medical documents for patients. By combining Optical Character Recognition (OCR), Google's Gemini generative AI, and professional document rendering, MediBridge AI translates technical lab results and diagnostics into plain, reassuring, and actionable patient-friendly summaries.

---

## ✨ Features

- **🔒 Secure JWT Authentication**: Robust user signup and login flow with secure password hashing (`bcrypt`) and protected API endpoints.
- **📄 Multi-format Report Upload**: Upload medical reports in **PDF**, **PNG**, **JPG**, or **JPEG** formats, safely stored in the cloud via Cloudinary.
- **🔍 Hybrid OCR Engine**: Advanced text extraction from PDFs using `pdfplumber` and scanned images/scanned PDFs using `pytesseract` (Tesseract OCR).
- **🤖 Intelligent Gemini AI Analysis**: Powered by Google's `gemini-2.5-flash` model:
  - Generates patient-friendly, easy-to-read medical summaries.
  - Automatically identifies out-of-range/abnormal values (with reference ranges and interpretations).
  - Drafts specific questions patients can ask their doctors during follow-up visits.
- **💬 Interactive Report Chat**: A dedicated, safety-constrained AI assistant allowing patients to ask follow-up questions *specifically* about their medical report context (with built-in refusal of off-topic queries).
- **📋 User Dashboard & History**: Access a chronological history of uploaded reports, previous analyses, and details.
- **📥 Professional PDF Export**: Generate a beautifully styled, health-themed PDF summary of the AI analysis (complete with tables and disclaimers) using `reportlab`.
- **🛠️ Responsive Modern UI**: A sleek, dark-mode-first dashboard and interface built with React, Vite, and Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite** (Fast HMR development environment)
- **Tailwind CSS v4** (Modern styling)
- **React Router v7** (Declarative routing)
- **Axios** (API requests)
- **Lucide React** & **React Toastify** (Beautiful iconography & notifications)

### Backend
- **FastAPI** (High-performance ASGI python web framework)
- **SQLAlchemy ORM** (Database interaction & model definition)
- **PostgreSQL** (Relational SQL database)
- **Google Generative AI SDK** (`gemini-2.5-flash` for high speed & structured JSON outputs)
- **Tesseract OCR** & **pdfplumber** (OCR and PDF parsing)
- **ReportLab** (Dynamic PDF generation)
- **Cloudinary** (Secure cloud media hosting)

### Devops & Hosting
- **Docker & Docker Compose** (Containerized database, backend, and frontend)
- **Render** (Production environment configuration via `render.yaml`)

---

## 📂 Project Structure

```
├── backend/
│   ├── auth/              # JWT Token helpers & dependencies
│   ├── database/          # SQLAlchemy engine & session config
│   ├── models/            # SQLAlchemy database models (User, Report, Analysis)
│   ├── routes/            # FastAPI routers (auth, reports, profile)
│   ├── schemas/           # Pydantic schemas for request/response validation
│   ├── services/          # Core services (AI, Cloudinary, OCR, PDF generation)
│   ├── Dockerfile         # Docker container definition for Backend
│   ├── main.py            # FastAPI main entrypoint
│   └── requirements.txt   # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components (Layout, Navbar, ReportCard)
│   │   ├── pages/         # Screen views (Dashboard, Upload, ReportDetail, Login, Register)
│   │   ├── services/      # Axios API request clients
│   │   └── App.jsx        # Routing and application entry layout
│   ├── Dockerfile         # Multi-stage Docker build for React with Nginx
│   ├── nginx.conf         # Nginx routing configuration inside Docker
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── package.json       # Frontend dependencies
├── docker-compose.yml     # Local orchestration of DB, API, and Frontend
└── render.yaml            # Render Cloud blueprint for deployment
```

---

## 🚀 Getting Started

You can run MediBridge AI locally using either **Docker Compose** (recommended) or by running the backend and frontend services **separately**.

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) (For containerized setup)
- [Python 3.10+](https://www.python.org/) & [Node.js 18+](https://nodejs.org/) (For manual local setup)
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (For manual local setup on Windows/Linux)
- Accounts/API Keys for:
  - **Google AI Studio** (Gemini API Key)
  - **Cloudinary** (Cloud Name, API Key, API Secret)

---

### Setup Environment Variables
1. Duplicate the `.env.example` file in the root folder and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the required credentials:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@db:5432/medibridge
   SECRET_KEY=your_secure_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   # Windows only (if running without Docker):
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

---

### Option A: Running with Docker Compose (Recommended)
This runs the PostgreSQL database, FastAPI backend, and React frontend inside isolated containers.

1. Build and start the services:
   ```bash
   docker-compose up --build
   ```
2. Once running:
   - **Frontend**: http://localhost (or port configured in `docker-compose.yml`)
   - **Backend API**: http://localhost:8000
   - **Interactive API Docs (Swagger)**: http://localhost:8000/docs

---

### Option B: Running Locally (Manual Setup)

#### 1. Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

#### 2. Start the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL output by Vite (usually http://localhost:5173).

---

## ☁️ Deployment

### Deploying to Render
This repository includes a `render.yaml` configuration that sets up a PostgreSQL Database and a Docker-based Web Service for the backend.

1. Create a new **Blueprint** on Render.
2. Link your GitHub repository.
3. Define the environment variables in the Render dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GEMINI_API_KEY`
4. Deploy the services. The backend will automatically handle tables generation on startup.

---

## ⚖️ Disclaimer

> [!WARNING]  
> **MediBridge AI is NOT a replacement for professional medical advice, diagnosis, or treatment.**  
> The explanations, summaries, and identified values are generated by automated AI models (`gemini-2.5-flash` and OCR parsers) and are strictly for informational and educational purposes. Always consult a licensed healthcare professional or physician with any questions you have regarding your medical reports or health conditions.
