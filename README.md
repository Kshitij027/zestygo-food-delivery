🍔 Fasteat – Food Delivery Web App

A modern food delivery web application built using React, Node.js, Express, and SQLite.
Users can browse restaurants, view menus, and manage their cart through a clean and responsive interface.

🚀 Features

• Browse nearby restaurants
• View restaurant menus
• Add items to cart
• User authentication (login/signup)
• Backend REST API
• SQLite database integration
• Clean modern UI

🛠 Tech Stack

Frontend
React
CSS

Backend
Node.js
Express.js

Database
SQLite

Tools
Cursor IDE
Git
GitHub

📂 Project Structure

food-delivery-app
│
├── backend
│ ├── routes
│ ├── config
│ ├── server.js
│ └── food_delivery.db
│
├── src
│ ├── components
│ ├── App.js
│ └── index.js
│
├── public
└── README.md

⚡ Installation

Clone the repository

git clone https://github.com/Kshitij027/food-delivery-app.git

Install dependencies

npm install

Run frontend

npm start

Run backend

cd backend
node server.js

🖥 Screenshots

Add a screenshot of the running app here.

Example image file name: screenshot.png

📌 Future Improvements

• Order tracking
• Admin dashboard
• Restaurant search functionality
• Deployment to cloud

📍 Nearby Restaurants Feature

This app now includes a "Nearby Restaurants" feature that uses the Geoapify Places API to find restaurants within a 5 km radius.

### Setup Instructions

1.  **Get a Geoapify API Key**:
    *   Go to [Geoapify MyProjects](https://myprojects.geoapify.com/).
    *   Create a free account and a new project.
    *   Generate an **API Key**.

2.  **Configure Environment Variables**:
    *   Open `backend/.env` (create it if it doesn't exist).
    *   Add your API key:
        ```env
        GEOAPIFY_API_KEY=your_key_here
        ```
    *   Ensure `REACT_APP_API_BASE_URL` in the frontend or root matches your backend URL (default: `http://localhost:5000/api`).

3.  **Run and Test**:
    *   Start the backend: `cd backend && node server.js`.
    *   Start the frontend: `npm start`.
    *   Click on the **"Nearby"** link in the sidebar.
    *   Allow location permissions in your browser.


👨‍💻 Author

Kshitij Tomar

GitHub
https://github.com/Kshitij027