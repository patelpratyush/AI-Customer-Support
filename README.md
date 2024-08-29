# CodeBuddy

Welcome to the CodeBuddy! This repository contains an AI assistant that provides coding help and support through an intuitive and efficient interface.

## Features

- **Code Assistance:** Offers help with coding queries by providing code snippets, explanations, and suggestions for improvement.
- **Language Detection:** Automatically detects the programming language of provided code snippets.
- **Error Checking:** Identifies errors and suggests optimizations for better performance.
- **Clear Documentation:** Uses Markdown formatting for code snippets and provides high-level comments to explain the code.

# Project Structure

```bash
.
├── README.md
├── app
│   ├── api
│   │   └── chat
│   │       ├── rag.py
│   │       ├── rag_demo.ipynb
│   │       └── route.js
│   ├── chat
│   │   └── page.js
│   ├── globals.css
│   ├── landingpage
│   │   └── page.js
│   ├── layout.js
│   ├── page.js
│   ├── page.module.css
│   ├── protectedRoute.js
│   ├── signin
│   │   └── page.js
│   └── signup
│       └── page.js
├── firebase.js
```

## Technologies Used

- **Frontend:**
  - React
  - Next.js
  - Material UI
- **Backend:**
  - Firebase Firestore
  - Firebase Authentication
  - Firebase Storage
  - Python
- **Deployment:**
  - Vercel
- **Additional:**
  - MUI (Material UI)
 
## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- Node.js
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository:**

```bash
    https://github.com/patelpratyush/AI-Customer-Support
```

2. **Navigate to the project directory:**

```bash
    cd AI-Customer-Support
```

3. **Install dependencies**

```bash
    npm install
    # or
    yarn install
```

4. **Set up Firebase:**

- Create a Firebase project and add your Firebase configuration.
- Set up Firestore, Authentication, and Storage in the Firebase console.
- Replace the Firebase configuration in `firebase.js` with your project's details.

5. **Run the development server:**

```bash
    npm run dev
    # or
    yarn dev
```

5. **Open your browser and go to:**

```bash
    http://localhost:3000
```

## Usage

- Sign In: Use your email and password to sign in.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.
