# FinSight - AI-Powered Business Expense Tracker

FinSight is a modern, AI-powered expense tracking application designed to help businesses manage and analyze their expenses efficiently. The application uses advanced AI models (Gemini and Hugging Face) to provide intelligent insights and categorization of expenses.

## Features

- 📊 Real-time expense tracking and management
- 🤖 AI-powered expense categorization and analysis
- 📈 Interactive analytics and visualizations
- 💰 Budget management and tracking
- 🔍 Advanced search and filtering capabilities
- 📱 Responsive design for all devices

## Tech Stack

### Backend
- Node.js with Express.js
- SQLite database (better-sqlite3)
- Gemini AI API for intelligent analysis
- Hugging Face API for additional AI capabilities

### Frontend
- Vanilla JavaScript
- Modern CSS with responsive design
- Interactive data visualizations

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Gemini API Key
- Hugging Face API Key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/finsight.git
cd finsight
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
GEMINI_API_KEY=your_gemini_api_key
HUGGING_FACE_API_KEY=your_huggingface_api_key
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Expenses
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses` - Get all expenses (with optional search and category filters)
- `PUT /api/expenses/:id` - Update an existing expense
- `DELETE /api/expenses/:id` - Delete an expense

### Categories
- `GET /api/categories` - Get all expense categories
- `POST /api/categories` - Create a new category
- `DELETE /api/categories/:id` - Delete a category

### Analytics
- `GET /api/analytics` - Get expense analytics and summaries

## Development

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests

## Deployment

The application is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for serverless deployment.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 