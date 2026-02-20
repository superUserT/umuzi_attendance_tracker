Gamified Attendance Tracker

This is a full-stack web application designed to make tracking event attendance easy and engaging. Admins can create events, generate unique QR codes, and track attendance on a live leaderboard. Users simply scan the QR code to check in and earn points, without needing to create an account beforehand.
Features

    Admin Dashboard: Create new events, set durations, and assign a host and description.

    Dynamic QR Codes: Automatically generate a unique, shareable, and downloadable QR code for every event.

    Gamification: Users earn points based on the type of event they attend (short online, long online, or in-person).

    Live Leaderboard: Track which users have the most points and view their detailed attendance history.

    Excel Export: Download the full attendance report and leaderboard as an Excel spreadsheet with one click.

    Scan Protection: Users cannot scan into the same event twice.

Tech Stack

    Frontend: React (built with Vite), Material UI for styling, and Axios for API requests.

    Backend: Node.js and Express.

    Database: MongoDB (using Mongoose).

Local Setup

To get this project running on your own computer, you will need Node.js installed and a MongoDB connection string (either local or via a service like MongoDB Atlas or Railway).
1. Backend Setup

    Open your terminal and navigate to the backend folder:
    cd backend

    Install the necessary dependencies:
    npm install

    Create a file named .env in the backend folder and add your database connection string:
    MONGO_URI=your_mongodb_connection_string_here

    Start the backend server:
    npm run dev
    (The server should start on port 5000 and log that MongoDB is connected).

2. Frontend Setup

    Open a new terminal window and navigate to the frontend folder:
    cd frontend

    Install the frontend dependencies:
    npm install

    Create a file named .env in the frontend folder to point to your local backend:
    VITE_API_URL=http://localhost:5000

    Start the frontend development server:
    npm run dev

    Open the link provided in your terminal (usually http://localhost:5173) to view the application.

Deployment Notes (Railway)

If you are hosting this application on Railway, keep these configuration steps in mind:

    Database: If you add a MongoDB database directly in Railway, it provides a variable named MONGO_URL. Make sure to pass this to your backend by creating a custom variable in your backend service where MONGO_URI is set to the value of ${MONGO_URL}.

    Frontend Connection: Your deployed frontend needs to know where your deployed backend lives. In your frontend service on Railway, add an environment variable called VITE_API_URL and set it to your backend's public web address.

    CORS: Ensure your backend server.js file allows cross-origin requests from your frontend's public web address so the two services can talk to each other without being blocked.