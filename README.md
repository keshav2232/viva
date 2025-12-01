# Ruthless Viva Simulator

A voice-first web application where students practice oral exams with an AI examiner.

## Features
- **Voice Interaction**: Speak your answers, hear the examiner.
- **Three Personas**: Friendly Teacher, Confused Peer, Ruthless Examiner.
- **Real-time Feedback**: Detects filler words and analyzes clarity.
- **Detailed Summary**: Get a score and improvement tips at the end.

## Setup

### Prerequisites
- Node.js (v16+)
- OpenAI API Key

### Installation

1.  **Backend**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in `backend/` with:
    ```
    OPENAI_API_KEY=your_api_key_here
    PORT=3000
    ```

2.  **Frontend**
    ```bash
    cd frontend
    npm install
    ```

## Running the App

1.  **Start Backend**
    ```bash
    cd backend
    npm run dev
    ```
    Server runs on `http://localhost:3000`.

2.  **Start Frontend**
    ```bash
    cd frontend
    npm run dev
    ```
    App runs on `http://localhost:5173`.

## Usage
1.  Open the frontend URL.
2.  Enter a topic (e.g., "React Hooks").
3.  Select a persona (try "Ruthless Examiner" for fun).
4.  Click "Start Viva".
5.  Allow microphone access.
6.  Speak your answers clearly!
