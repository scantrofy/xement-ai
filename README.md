# XementAI - AI-Powered Smart Cement Operations

An intelligent cement manufacturing optimization platform made for JK Cement that leverages AI/ML models, real-time monitoring, and predictive analytics to optimize energy consumption, reduce emissions, and improve production efficiency in cement plants.

## 🏭 Key Features 

### 🤖 AI-Powered Optimization Engine
- **Gemini AI Integration** - Advanced AI recommendations with concise, data-driven responses
- **Intelligent Chatbot** - Context-aware assistant for KPIs, anomalies, and optimization queries
- **Energy Prediction Models** - Vertex AI endpoints for energy consumption forecasting
- **Fuel Mix Simulation** - Alternative fuel optimization with emission calculations
- **Comprehensive Anomaly Detection** - 7-parameter monitoring with critical/warning thresholds
- **Predictive Analytics** - Machine learning models for production optimization

### 📊 Real-Time Monitoring Dashboard
- **Live KPI Tracking** - Energy use, grinding efficiency, kiln temperature, CO₂ emissions
- **Production Timeline** - Historical and real-time production data visualization
- **Smart Alert System** - Minimized alert monitor with beeping indicators and localStorage caching
- **Performance Metrics** - Comprehensive production quality and volume monitoring
- **Dynamic UI Components** - Responsive chatbot and alert monitor with smooth transitions

### 🎯 Scenario Simulation & Planning
- **Fuel Mix Optimization** - Simulate different alternative fuel percentages
- **Energy Savings Verification** - Compare original vs recommended operational parameters
- **Impact Analysis** - ROI calculations and efficiency gain projections
- **Implementation Planning** - Step-by-step optimization implementation guides

### 🔧 Advanced Analytics & Insights
- **Enhanced Anomaly Detection** - Multi-parameter thresholds (grinding efficiency, kiln temp, energy, emissions, quality, fan speed, feed rate)
- **Optimized API Calls** - localStorage caching to prevent unnecessary backend requests
- **Energy Saving Notebooks** - Jupyter notebooks for data analysis and model development
- **Cloud Function Integration** - Scalable backend processing with Google Cloud
- **Stream Processing** - Real-time data ingestion and processing capabilities
- **Period-Based Reporting** - Daily/Weekly filters with reactive data updates using useMemo

## 🏗️ Architecture Overview

This platform consists of three main components:

### Backend (Python/FastAPI)
- **Gemini AI**: Context-aware chatbot with BigQuery data integration
- **Smart Chatbot Service**: Concise responses, off-topic filtering, and fallback mechanisms
- **Vertex AI**: Energy prediction models and endpoints
- **Fuel Simulator**: Alternative fuel mix optimization algorithms
- **BigQuery Integration**: Real-time plant data fetching
- **Firestore Integration**: Alert storage and anomaly tracking
- **Cloud Functions**: Scalable processing and data ingestion

### Frontend (React/Vite)
- **Overview Dashboard**: Real-time KPI monitoring and production metrics
- **AI Recommendations Engine**: Interactive optimization suggestions with skeleton loaders
- **Scenario Simulator**: Fuel mix and parameter simulation tools
- **Alerts & Anomalies Monitor**: Smart caching system with localStorage persistence
- **Floating Chatbot**: Dynamic positioning with alert monitor integration
- **Reports & Insights**: Period-based filtering (Daily/Weekly) with reactive metrics
- **Firebase Authentication**: Secure user authentication with role-based access
- **Theme Support**: Light/Dark mode with persistent preferences

### Analytics & Research
- **Jupyter Notebooks**: Data analysis and model development
- **Machine Learning Models**: Anomaly detection and predictive analytics
- **Research Scripts**: Experimental algorithms and data processing

## 📋 Prerequisites

### Backend Requirements
- Python 3.13+
- Google Cloud SDK
- Vertex AI API access
- Gemini API credentials
- BigQuery access
- Firestore database
- Service account credentials

### Frontend Requirements
- Node.js (v16.x or higher)
- npm or yarn

## 🛠️ Installation & Setup

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
3. Create environment file:
   ```bash
   cp .env.example .env.development
   # Configure:
   # VITE_API_BASE_URL=http://localhost:8000
   # VITE_API_TIMEOUT=30000
   # VITE_FIREBASE_API_KEY=your-firebase-api-key
   # VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   # VITE_FIREBASE_PROJECT_ID=your-project-id
   # VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   # VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   # VITE_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   # Includes: fastapi, uvicorn, google-cloud-bigquery, google-cloud-firestore,
   # google-generativeai, python-dotenv, firebase-admin, pandas, pydantic
   ```

3. Create `.env` file in project root:
   ```bash
   # Backend Environment Variables
   GEMINI_API_KEY=your-gemini-api-key
   GOOGLE_APPLICATION_CREDENTIALS=iam.json
   GCP_PROJECT_ID="your-gcp-project-id"
   BQ_DATASET="your-bigquery-dataset"
   BQ_DATASET_LOCATION="your-bigquery-dataset-location"
   BQ_TABLE="your-bigquery-table"
   NUM_ROW="your-bigquery-row-count"
   PLANTS="your-plants"
   SIMULATE_FREQ_MINUTES="your-simulate-freq-minutes"
   SIMULATE_MODE="your-simulate-mode"
   SIMULATE_BATCH_SIZE="your-simulate-batch-size" # used in stream mode
   STREAM_TABLE="your-stream-table"

   FIRESTORE_DB="your-firestore-db"

   REDIS_URL="your-redis-url"

   VERTEX_REGION="your-vertex-region"
   VERTEX_ENDPOINT_ID="your-vertex-endpoint-id"

   ENV="your-env" #development or production

   SMTP_SERVER="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USERNAME="your-smtp-username"
   SMTP_PASSWORD="your-smtp-password"
   FROM_EMAIL="your-from-email"
   ```

4. Place service account credentials:
   ```bash
   # Place iam.json in project root directory
   # This file contains Google Cloud service account credentials
   ```

5. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   # Server will start at http://localhost:8000
   # API docs available at http://localhost:8000/docs
   ```

## 📁 Project Structure

```
xement-ai/
├── backend/                    # Python backend services
│   ├── app/
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── routers/          # API route handlers
│   │   │   ├── run_cycle_router.py    # Anomaly detection endpoint
│   │   │   ├── chatbot_router.py      # Chatbot API endpoint
│   │   │   └── auth_router.py         # Authentication endpoints
│   │   ├── services/         # Business logic services
│   │   │   ├── chatbot_service.py     # Gemini AI chatbot logic
│   │   │   ├── firestore_service.py   # Firestore integration
│   │   │   └── bigquery_service.py    # BigQuery data fetching
│   │   └── middleware/       # Authentication middleware
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile             # Backend containerization
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── chatbot/              # Floating chatbot component
│   │   │   ├── AlertNotificationManager.jsx  # Alert monitor
│   │   │   └── ui/                   # UI primitives
│   │   ├── pages/            # Main application pages
│   │   │   ├── overview-dashboard/      # Real-time monitoring
│   │   │   ├── ai-recommendations-engine/ # AI optimization
│   │   │   ├── scenario-simulator/      # Simulation tools
│   │   │   ├── alerts-anomalies-monitor/ # Alert management
│   │   │   ├── reports-insights/        # Reports with period filters
│   │   │   └── auth/                    # Login/Signup pages
│   │   ├── api/              # API integration hooks
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useChatbot.js         # Chatbot hooks
│   │   ├── contexts/         # React context providers
│   │   │   ├── AuthContext.jsx       # Firebase authentication
│   │   │   └── ThemeContext.jsx      # Light/Dark theme
│   │   └── config/           # Configuration files
│   │       ├── firebase.js           # Firebase config
│   │       └── firestore.js          # Firestore client
│   ├── public/               # Static assets
│   ├── .env.development      # Development environment variables
│   └── package.json          # Frontend dependencies
├── iam.json             # Google Cloud service account credentials
├── .env                        # Backend environment variables
└── README.md                   # This file
```

## 🚀 Key Application Pages

### Overview Dashboard (`/`)
- Real-time KPI monitoring (energy use, grinding efficiency, kiln temperature)
- Production timeline visualization
- Alert feed for operational anomalies
- Production summary and performance metrics

### AI Recommendations Engine (`/ai-recommendations-engine`)
- Gemini AI-powered optimization suggestions
- Parameter comparison (current vs recommended values)
- Energy savings verification and impact analysis
- Implementation planning with step-by-step guides

### Scenario Simulator (`/scenario-simulator`)
- Fuel mix optimization simulations
- Alternative fuel percentage testing
- Energy consumption and emission calculations
- ROI and efficiency gain projections

### Alerts & Anomalies Monitor (`/alerts-anomalies-monitor`)
- **Enhanced Anomaly Detection** - 7-parameter monitoring system
  - Grinding Efficiency (Critical: <82%, Warning: <88%)
  - Kiln Temperature (Critical: >1500°C, Warning: >1480°C or <1400°C)
  - Energy Consumption (Critical: >170 kWh/ton, Warning: >160 kWh/ton)
  - CO2 Emissions (Critical: >120 kg/ton, Warning: >110 kg/ton)
  - Product Quality (Critical: <75, Warning: <80)
  - Fan Speed (Warning: >85% or <65%)
  - Feed Rate (Warning: >120 or <90)
- **Smart Caching** - localStorage persistence to prevent unnecessary API calls
- **Last Checked Indicator** - Shows timestamp of last anomaly check
- **Alert Acknowledgment** - Mark alerts as acknowledged with user tracking
- **Minimized by Default** - Alert monitor starts minimized with beeping green indicator

### Floating Chatbot (`/chatbot`)
- **Gemini Integration** - Context-aware AI assistant
- **Real-time Plant Data** - Fetches latest KPIs from BigQuery
- **Anomaly Awareness** - Integrates recent alerts from Firestore
- **Concise Responses** - Optimized for brief, actionable answers (2-3 paragraphs max)
- **Off-topic Filtering** - Single-sentence responses for non-cement queries
- **Dynamic Positioning** - Moves up/down based on alert monitor state
- **Sound Controls** - Mute/unmute notifications
- **Authentication Required** - Firebase auth integration

### Reports & Insights (`/reports-insights`)
- **Period-Based Filtering** - Daily (24 hours) or Weekly (168 hours) views
- **Reactive Metrics** - useMemo-based calculations for instant updates
- **AI-Generated Insights** - Trend analysis and recommendations
- **Energy Trend Charts** - Interactive visualizations with Recharts
- **Optimizations Table** - Track improvements and their impact
- **PDF Export** - Generate comprehensive reports

## 🤖 AI & Machine Learning Features

### Gemini AI Chatbot
- **Context-Aware Responses**: Uses real-time BigQuery plant data and Firestore anomalies
- **Concise Communication**: Optimized for 2-3 paragraph responses with bullet points
- **Off-Topic Handling**: Single-sentence responses for non-cement queries
- **Fallback Mechanism**: Provides helpful responses even when Gemini API is unavailable
- **Data-Driven**: Always cites actual numbers from current plant status

### AI Recommendations Engine
- **Smart Recommendations**: Context-aware optimization suggestions
- **Parameter Analysis**: Intelligent analysis of operational parameters
- **Confidence Scoring**: AI confidence levels for recommendations
- **Natural Language Explanations**: Human-readable optimization reasoning
- **Skeleton Loaders**: Professional loading states during AI cycle execution

### Vertex AI Models
- **Energy Prediction**: Accurate energy consumption forecasting
- **Anomaly Detection**: Statistical and ML-based anomaly identification
- **Fuel Optimization**: Alternative fuel mix recommendations
- **Performance Modeling**: Production efficiency predictions

## 🌱 Environmental Impact Features

- **CO₂ Emission Tracking**: Real-time carbon footprint monitoring
- **Alternative Fuel Optimization**: Reduce fossil fuel dependency
- **Energy Efficiency**: Minimize energy consumption per ton of cement
- **Sustainability Metrics**: Track environmental performance indicators

## 📊 Data Visualization & Analytics

- **Interactive Dashboards**: Real-time data visualization with D3.js and Recharts
- **Time Series Analysis**: Historical trend analysis and forecasting
- **KPI Monitoring**: Key performance indicator tracking and alerts
- **Comparative Analysis**: Before/after optimization comparisons

## 🔧 Technical Stack

### Frontend Technologies
- **React 18** - Modern React with concurrent features and hooks
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework with dark mode support
- **React Query (@tanstack/react-query)** - Server state management and caching
- **React Router v6** - Declarative routing with protected routes
- **Recharts** - Responsive data visualization library
- **Lucide React** - Beautiful icon library
- **Firebase SDK** - Authentication and Firestore integration
- **Axios** - HTTP client with interceptors for auth tokens

### Backend Technologies
- **Python 3.13/FastAPI** - High-performance async API framework
- **Google Cloud BigQuery** - Real-time plant data storage and querying
- **Google Cloud Firestore** - Alert and anomaly storage
- **Gemini AI** - Advanced AI model for chatbot responses
- **Google Cloud Vertex AI** - Machine learning platform for predictions
- **Firebase Admin SDK** - Authentication and user management
- **Pandas** - Data manipulation and analysis
- **Pydantic** - Data validation and serialization
- **python-dotenv** - Environment variable management

### Cloud & DevOps
- **Google Cloud Platform** - Cloud infrastructure
- **Cloud Functions** - Serverless computing
- **Cloud Build** - CI/CD pipeline
- **Docker** - Containerization

## 📦 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy to your preferred hosting platform
```

### Backend Deployment
```bash
cd backend
# Build Docker image
docker build -t cement-ops-backend .
# Deploy to Google Cloud Run or your preferred platform
```

### Cloud Function Deployment
```bash
cd scripts/cloud_function
gcloud functions deploy cement-ops-function --runtime python39 --trigger-http
```

## ✨ Recent Improvements & Optimizations

### Performance Optimizations
- **localStorage Caching**: Alerts page now caches data to prevent unnecessary API calls on navigation/refresh
- **Reactive Metrics**: Reports page uses `useMemo` for instant metric updates when switching between Daily/Weekly periods
- **Skeleton Loaders**: AI Recommendations Engine shows professional loading states matching actual layout
- **Optimized Queries**: Removed Firestore `orderBy` clauses that required indexes, sorting in memory instead

### User Experience Enhancements
- **Minimized Alert Monitor**: Starts collapsed by default with animated beeping green indicator
- **Dynamic Chatbot Positioning**: Automatically adjusts position based on alert monitor state (smooth 300ms transitions)
- **Concise AI Responses**: Chatbot optimized for brief, actionable 2-3 paragraph responses
- **Off-Topic Filtering**: Single-sentence responses for non-cement queries
- **Light Mode Fixes**: Improved icon visibility in chatbot header
- **Theme Persistence**: Light/Dark mode preferences saved to localStorage

### Backend Improvements
- **BigQuery Integration**: Direct data fetching
- **Enhanced Anomaly Detection**: 7-parameter monitoring with critical/warning thresholds
- **Fallback Mechanisms**: Chatbot provides helpful responses even when Gemini API is unavailable
- **Environment Variable Loading**: Proper `python-dotenv` integration with absolute path resolution
- **Console Logging**: Configured logging for better debugging and monitoring

### Code Quality
- **Removed Unnecessary Comments**: Cleaned up codebase by removing redundant inline comments
- **Consistent Formatting**: Standardized code style across all components
- **Error Handling**: Improved error messages and fallback responses
- **Type Safety**: Better TypeScript/PropTypes usage for component props

## 🔑 Test Credentials

For development and testing purposes:

### Admin Account
```
Email: admin@example.com
Password: admin123
```

**Note**: These are test accounts configured in Firebase Authentication for development. In production, use proper user management and strong passwords.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud AI Platform** - For Vertex AI, Gemini Pro AI, BigQuery, and Firestore services
- **Firebase** - For authentication and real-time database capabilities
- **React Community** - For the amazing ecosystem and tools
- **TailwindCSS Team** - For the utility-first CSS framework
- **Lucide Icons** - For the beautiful icon library
- **JK Cement** - For the opportunity to build this optimization platform
- **Open Source Contributors** - For the libraries and frameworks used

---

Built with ❤️ for sustainable cement manufacturing optimization | Made for JK Cement

**Project Status**: ✅ Production Ready | 🚀 Actively Maintained | 📊 Real-time Monitoring Enabled
