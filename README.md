# Exam Generator Frontend

A React-based web application for generating multiple-choice exam questions from PDF documents.

## Features

- PDF file upload
- AI-powered question generation
- Interactive multiple-choice interface
- Material-UI components for modern design
- Responsive layout

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file for development:
```
REACT_APP_API_URL=http://localhost:5000
```

For production, update `.env.production`:
```
REACT_APP_API_URL=your-backend-url
```

3. Run the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

## Deployment

This frontend is ready for deployment on Vercel:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

## Environment Variables

- `REACT_APP_API_URL`: Backend API endpoint

## Technologies Used

- React
- Material-UI
- Axios
- Vercel (deployment)
