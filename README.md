# Todo List App ✅

A full-stack todo application with user authentication built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication** - Register and login with JWT tokens
- **CRUD Operations** - Create, read, update, delete todos
- **User-Specific Data** - Each user sees only their own todos
- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - No page refresh needed

## 🛠 Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Authentication:** JWT, bcrypt
- **Database:** MongoDB Atlas
- **Deployment:** Railway

## 📸 Screenshots


## 🚀 Live Demo

(https://todo-app-production-3ab2.up.railway.app/)

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/todo-app.git
   ```

2. **Install dependencies**
   ```bash
   cd todo-app
   npm install
   ```

3. **Set up environment variables**
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

## 📁 Project Structure

```
todo-app/
├── models/          # Database models
├── middleware/      # Authentication middleware
├── routes/          # API routes
├── public/          # Frontend files
├── config/          # Database configuration
├── server.js        # Main server file
└── package.json     # Dependencies
```

## 🔐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/todos` | Get user's todos | Yes |
| POST | `/api/todos` | Create new todo | Yes |
| PUT | `/api/todos/:id` | Update todo | Yes |
| DELETE | `/api/todos/:id` | Delete todo | Yes |
