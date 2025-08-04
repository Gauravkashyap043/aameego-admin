# Aameego Admin Panel

## 🚀 Development & Production Server Setup

This admin panel supports both development and production environments with different API endpoints.

### 📋 Available Commands

#### Development Commands
```bash
# Start development server (localhost:9000 API)
npm run dev

# Start development server with host access (for mobile testing)
npm run dev:local

# Build for development environment
npm run build:dev

# Preview development build
npm run preview:dev
```

#### Production Commands
```bash
# Start production server (dev.aameego.com API)
npm run start

# Start production server with development API
npm run start:dev

# Build for production environment
npm run build

# Preview production build
npm run preview:prod
```

### 🌍 Environment Configuration

#### Development Environment (`.env.development`)
```
VITE_API_BASE_URL=http://localhost:9000/api/v1
VITE_ENV=development
```

#### Production Environment (`.env.production`)
```
VITE_API_BASE_URL=https://dev.aameego.com/api/v1
VITE_ENV=production
```

### 🔧 Usage Examples

#### For Local Development
```bash
# Start with local backend
npm run dev

# Start with local backend + host access
npm run dev:local
```

#### For Production Testing
```bash
# Start with production API
npm run start

# Build for production
npm run build
```

#### For Development Testing with Production Build
```bash
# Build development version
npm run build:dev

# Preview development build
npm run preview:dev
```

### 📊 Environment Detection

The application automatically detects the environment and shows it in the console:
- 🚀 **Development**: Uses `http://localhost:9000/api/v1`
- 🚀 **Production**: Uses `https://dev.aameego.com/api/v1`

### 🔄 Switching Environments

1. **Development Mode**: Uses local backend server
2. **Production Mode**: Uses hosted backend server
3. **Environment Variables**: Automatically loaded based on mode

### 📱 Mobile Testing

Use `npm run dev:local` to start the development server with host access, allowing you to test the admin panel on mobile devices connected to the same network.

### 🛠️ Troubleshooting

- **API Connection Issues**: Check if the backend server is running
- **Environment Variables**: Ensure `.env.development` and `.env.production` files exist
- **Port Conflicts**: Vite will automatically find an available port

### 📝 Notes

- Development mode uses localhost backend
- Production mode uses hosted backend
- Environment variables are automatically loaded based on the mode
- Console logs show current environment and API URL for debugging
