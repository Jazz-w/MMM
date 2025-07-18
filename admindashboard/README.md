# ParaPharm Admin Dashboard

A modern, responsive admin dashboard for managing a parapharmacy e-commerce platform. Built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 Real-time dashboard with key metrics
- 👥 User management
- 📦 Product management
- 🗂️ Category management
- 🛍️ Order tracking and management
- 📈 Sales analytics
- 🔒 Secure authentication
- 🌙 Dark mode support
- 📱 Fully responsive design

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Axios for API calls
- React Router for navigation
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admindashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── api/            # API service layer
├── components/     # Reusable components
│   └── ui/        # UI components from shadcn/ui
├── lib/           # Utility functions
├── pages/         # Page components
├── styles/        # Global styles
└── types/         # TypeScript types
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

## API Integration

The dashboard connects to a RESTful API with the following endpoints:

### Authentication
- POST `/api/auth/login` - Admin login
- POST `/api/auth/google` - Google OAuth login

### Users
- GET `/api/admin/users` - List all users
- POST `/api/admin/users` - Create user
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Delete user

### Products
- GET `/api/admin/products` - List all products
- POST `/api/admin/products` - Create product
- PUT `/api/admin/products/:id` - Update product
- DELETE `/api/admin/products/:id` - Delete product

### Categories
- GET `/api/admin/categories` - List all categories
- POST `/api/admin/categories` - Create category
- PUT `/api/admin/categories/:id` - Update category
- DELETE `/api/admin/categories/:id` - Delete category

### Orders
- GET `/api/admin/orders` - List all orders
- GET `/api/admin/orders/:id` - Get order details
- PUT `/api/admin/orders/:id/status` - Update order status

### Dashboard Stats
- GET `/api/admin/stats` - Get dashboard statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
