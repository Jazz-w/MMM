# E-Commerce Platform - MMM

A full-stack e-commerce platform built with React, Node.js, and MongoDB, featuring a customer-facing store, admin dashboard, and Kubernetes deployment configurations.

## 🚀 Features

### Customer Frontend
- **Product Catalog**: Browse products by categories with advanced filtering
- **Shopping Cart**: Add, remove, and manage items in cart
- **User Authentication**: Register, login with Google OAuth integration
- **Order Management**: Place orders and view order history
- **Product Search**: Search products with real-time filtering
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Admin Dashboard
- **Product Management**: Create, edit, delete products and categories
- **Order Management**: View and manage customer orders
- **User Management**: Manage customer accounts and permissions
- **Analytics Dashboard**: View sales and user metrics
- **Role-based Access**: Secure admin authentication and permissions

### Backend API
- **RESTful API**: Complete CRUD operations for all resources
- **Authentication**: JWT-based auth with Google OAuth support
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Image upload for products using Multer
- **Metrics**: Prometheus metrics integration
- **Security**: CORS, helmet, and other security middleware

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components [[memory:3622243]]
- **React Router** for navigation
- **Zustand** for state management

### Admin Dashboard
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** components [[memory:3622243]]
- **Chart.js** for analytics

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Google OAuth 2.0**
- **Multer** for file uploads
- **Prometheus** for metrics
- **CORS** and security middleware

### DevOps & Deployment
- **Docker** containers for all services
- **Kubernetes** deployment configurations
- **Nginx** for load balancing
- **MongoDB** database deployment
- **Prometheus & Grafana** for monitoring

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Docker (for containerized deployment)
- Kubernetes cluster (for K8s deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jazz-w/MMM.git
   cd MMM
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Copy environment template and configure
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, and Google OAuth credentials
   
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Copy environment template and configure
   cp .env.example .env
   # Edit .env with your API URL and Google OAuth client ID
   
   npm start
   ```

4. **Setup Admin Dashboard**
   ```bash
   cd admindashboard
   npm install
   
   # Copy environment template and configure
   cp .env.example .env
   # Edit .env with your API URL
   
   npm start
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
```

#### Admin Dashboard (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Docker Deployment

1. **Setup MongoDB (Required first)**
   ```bash
   # Pull and run MongoDB container
   docker pull mongo:6.0
   docker run -d --name ecommerce-mongodb -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     -e MONGO_INITDB_DATABASE=ecommerce \
     mongo:6.0
   ```

2. **Build and Deploy Backend**
   ```bash
   cd server
   docker build -t ecommerce-backend .
   docker run -d --name ecommerce-backend -p 5000:5000 \
     --link ecommerce-mongodb:mongodb \
     -e MONGODB_URI=mongodb://admin:password@mongodb:27017/ecommerce?authSource=admin \
     -e JWT_SECRET=your_jwt_secret_here \
     -e GOOGLE_CLIENT_ID=your_google_client_id \
     -e GOOGLE_CLIENT_SECRET=your_google_client_secret \
     ecommerce-backend
   ```

3. **Build and Deploy Frontend**
   ```bash
   cd frontend
   docker build -t ecommerce-frontend \
     --build-arg REACT_APP_API_URL=http://localhost:5000 \
     --build-arg REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here \
     --build-arg REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000 \
     .
   docker run -d --name ecommerce-frontend -p 3000:80 ecommerce-frontend
   ```

4. **Build and Deploy Admin Dashboard**
   ```bash
   cd admindashboard
   docker build -t ecommerce-admin \
     --build-arg REACT_APP_API_URL=http://localhost:5000 \
     .
   docker run -d --name ecommerce-admin -p 3001:80 ecommerce-admin
   ```

   **Access the applications:**
   - Backend API: `http://localhost:5000`
   - Frontend Store: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3001`
   - MongoDB: `localhost:27017`

### Kubernetes Deployment

1. **Deploy to Kubernetes cluster**
   ```bash
   cd k8s
   
   # Create secrets (update with your values)
   kubectl apply -f secrets-template.yaml
   
   # Deploy all services
   ./deploy-all.sh
   
   # Deploy monitoring stack
   ./deploy-monitoring.sh
   ```

2. **Verify deployment**
   ```bash
   ./validate-deployment.sh
   ```

## 📱 Usage

### Customer Store
- Access at: `http://localhost:3000`
- Browse products, add to cart, place orders
- Create account or login with Google

### Admin Dashboard
- Access at: `http://localhost:3001`
- Login with admin credentials
- Manage products, orders, and users

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID

#### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status

## 🔧 Development

### Project Structure
```
MMM/
├── frontend/           # Customer-facing React app
├── admindashboard/     # Admin React dashboard
├── server/            # Node.js Express API
├── k8s/              # Kubernetes configurations
├── scripts/          # Utility scripts
└── README.md
```

### Scripts

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

#### Frontend & Admin
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📊 Monitoring

The application includes comprehensive monitoring with:
- **Prometheus** metrics collection
- **Grafana** dashboards for visualization
- **MongoDB exporter** for database metrics
- **Node exporter** for system metrics

Access Grafana at: `http://localhost:3000` (when deployed with monitoring stack)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide React](https://lucide.dev/)
- Monitoring setup inspired by Kubernetes community best practices

## 📞 Support

For support, email jazzxbusiness@outlook.com or create an issue in the GitHub repository.

---

**Made with ❤️ by [Jazz-w](https://github.com/Jazz-w)** 
