# FitSphere Backend

## Overview
FitSphere is a fitness application built using the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. The backend of the application handles user registration, authentication, doctor appointments,  slot managemenet and other core functionalities related to fitness tracking and health guidance.

## What I've Done So Far

### 1. **Created the Backend Folder**
   - Created a dedicated folder for the backend of the FitSphere application.

### 2. **Installed Dependencies**
   - Installed all necessary dependencies for the backend, including:
     - `express` - Web framework for Node.js.
     - `mongoose` - MongoDB object modeling.
     - `jsonwebtoken` - JWT for authentication.
     - `typedi` - Dependency Injection library for TypeScript.
     - `bcryptjs` - Password hashing and verification.
     - `zod` - For input validation.
     - `dotenv` - For managing environment variables.

   The full list of dependencies is specified in the `package.json` file.

### 3. **Set Up the Server**
   - Created an Express server that listens on a specific port and serves the API endpoints.
   - The server is set up to listen on port `5000` by default.
   - Configured server to handle requests and responses in a clean architecture style.

### 4. **Connected to the Database**
   - Connected the backend to a MongoDB database using Mongoose.
   - Configured the database connection URL and credentials in environment variables.
   - Established models for users and sessions to interact with the database.

### 5. **Created a New Branch**
   - Created a new branch `authentication-feat` to work on the user registration feature.
   - This branch isolates the user registration functionality to ensure clean version control.
   - more to go.....

### 6. **Started Working on User Registration**
   - Implemented user registration functionality in the backend.
   - The registration process includes:
     - Validating the user input.
     - Using `Zod` for Schema validation , a TypeScript-first schema declaration and validation library
     - Hashing the password using bcrypt.
     - Creating a new user record in the database.
     - Sending verification mail to the emial
     - Generating JWT tokens (access and refresh tokens) for user authentication.

### 7. **Implemented Dependency Injection Using Typedi**
   - Set up **Typedi** for dependency injection in the backend.
   - Created services for user registration and authentication.
   - Used the `@Service()` decorator to mark classes as injectable and the `@Inject()` decorator to inject dependencies.
   - This approach ensures that the backend follows the clean architecture principles, making it more maintainable and scalable.
