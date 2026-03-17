# Cognitive Load Monitoring System

A full-stack web application to track and analyze cognitive load based on daily tasks. Built with Node.js, Express, MongoDB, and Vanilla JS.

## Features
- **Authentication**: JWT-based Login and Registration.
- **Task Management**: Add, view, and delete tasks with duration and cognitive load rating.
- **Analytics**: 
    - Daily Load Line Chart (Last 7 Days)
    - Weekly Average Load Bar Chart
    - **Overload Alert**: Detects if usage exceeds threshold for 3 consecutive days.
- **Backend Logic**: All calculations performed server-side.

## Tech Stack
- **Frontend**: HTML5, CSS3 (Dark Theme), Vanilla JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Setup & Run

1.  **Prerequisites**: Ensure Node.js and MongoDB are installed and running.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    - Check `backend/.env` for configuration (default PORT: 5000, MongoURI: local).
4.  **Run Server**:
    ```bash
    node server.js
    ```
5.  **Access App**:
    - Open `index.html` (or `http://localhost:5000` if serving static files is set up correctly, but opening `index.html` directly works if API_URL is correct, though cors is enabled so `localhost:5000` is better). 
    - The server is configured to serve the `frontend` folder statically. Open browser: `http://localhost:5000`

## Architecture
- **MVC Pattern**: Models (DB schemas), Views (HTML/JS), Controllers (Logic).
- **Backend Logic**: core calculations (summing load) happen in `analyticsController.js`.
