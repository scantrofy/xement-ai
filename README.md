# Xement.AI - AI-Powered Smart Cement Operations

An intelligent cement manufacturing optimization platform made for JK Cement that leverages AI/ML models, real-time monitoring, and predictive analytics to optimize energy consumption, reduce emissions, and improve production efficiency in cement plants.

## 🏭 Key Features 

### 🤖 AI-Powered Optimization Engine
- **Gemini AI Integration** - Advanced AI recommendations for parameter optimization
- **Energy Prediction Models** - Vertex AI endpoints for energy consumption forecasting
- **Fuel Mix Simulation** - Alternative fuel optimization with emission calculations
- **Anomaly Detection** - Real-time identification of operational anomalies
- **Predictive Analytics** - Machine learning models for production optimization

### 📊 Real-Time Monitoring Dashboard
- **Live KPI Tracking** - Energy use, grinding efficiency, kiln temperature, CO₂ emissions
- **Production Timeline** - Historical and real-time production data visualization
- **Alert System** - Automated alerts for operational anomalies and threshold breaches
- **Performance Metrics** - Comprehensive production quality and volume monitoring

### 🎯 Scenario Simulation & Planning
- **Fuel Mix Optimization** - Simulate different alternative fuel percentages
- **Energy Savings Verification** - Compare original vs recommended operational parameters
- **Impact Analysis** - ROI calculations and efficiency gain projections
- **Implementation Planning** - Step-by-step optimization implementation guides

### 🔧 Advanced Analytics & Insights
- **Isolation Forest Baseline** - Statistical anomaly detection algorithms
- **Energy Saving Notebooks** - Jupyter notebooks for data analysis and model development
- **Cloud Function Integration** - Scalable backend processing with Google Cloud
- **Stream Processing** - Real-time data ingestion and processing capabilities

## 🏗️ Architecture Overview

This platform consists of three main components:

### Backend (Python/FastAPI)
- **AI Models**: Gemini AI integration for optimization recommendations
- **Vertex AI**: Energy prediction models and endpoints
- **Fuel Simulator**: Alternative fuel mix optimization algorithms
- **Cloud Functions**: Scalable processing and data ingestion

### Frontend (React/Vite)
- **Overview Dashboard**: Real-time KPI monitoring and production metrics
- **AI Recommendations Engine**: Interactive optimization suggestions
- **Scenario Simulator**: Fuel mix and parameter simulation tools
- **Alerts & Anomalies Monitor**: Real-time alert management system

### Analytics & Research
- **Jupyter Notebooks**: Data analysis and model development
- **Machine Learning Models**: Anomaly detection and predictive analytics
- **Research Scripts**: Experimental algorithms and data processing

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- Google Cloud SDK
- Vertex AI API access
- Gemini API credentials

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
   cp .env.example .env
   # Configure VITE_API_BASE_URL, VITE_API_TIMEOUT
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
   ```

3. Configure Google Cloud credentials:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

## 📁 Project Structure

```
xement-ai/
├── backend/                    # Python backend services
│   ├── energy_verify.py       # Energy prediction and verification
│   ├── fuel_simulator.py      # Fuel mix optimization algorithms
│   ├── gemini_call.py         # Gemini AI integration
│   └── Dockerfile             # Backend containerization
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Main application pages
│   │   │   ├── overview-dashboard/      # Real-time monitoring
│   │   │   ├── ai-recommendations-engine/ # AI optimization
│   │   │   ├── scenario-simulator/      # Simulation tools
│   │   │   └── alerts-anomalies-monitor/ # Alert management
│   │   ├── api/              # API integration hooks
│   │   └── contexts/         # React context providers
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── gemini/                     # Gemini AI integration
│   ├── energy_verify.py      # Energy verification logic
│   ├── gemini_call.py        # AI API calls
│   └── schema.py             # Data schemas and models
├── notebooks/                  # Jupyter notebooks for analysis
│   ├── energy_saving.ipynb   # Energy optimization research
│   ├── fuel_mix_simulator.ipynb # Fuel simulation experiments
│   └── isolationforest_baseline.ipynb # Anomaly detection
├── scripts/                    # Deployment and utility scripts
│   ├── cloud_function/       # Google Cloud Function deployment
│   └── simulate_stream/      # Data streaming simulation
└── cloudbuild.yaml            # CI/CD configuration
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
- Real-time anomaly detection alerts
- Historical alert management
- Threshold configuration and monitoring
- System health status tracking

## 🤖 AI & Machine Learning Features

### Gemini AI Integration
- **Smart Recommendations**: Context-aware optimization suggestions
- **Parameter Analysis**: Intelligent analysis of operational parameters
- **Confidence Scoring**: AI confidence levels for recommendations
- **Natural Language Explanations**: Human-readable optimization reasoning

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
- **React 18** - Modern React with concurrent features
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Server state management and caching
- **React Router v6** - Declarative routing
- **Recharts & D3.js** - Data visualization libraries

### Backend Technologies
- **Python/FastAPI** - High-performance API framework
- **Google Cloud Vertex AI** - Machine learning platform
- **Gemini AI** - Advanced AI model integration
- **Pandas** - Data manipulation and analysis
- **Pydantic** - Data validation and serialization

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

## 🔐 Environment Configuration

### Frontend Environment Variables
```bash
VITE_API_BASE_URL,VITE_API_TIMEOUT
```

### Backend Environment Variables
```bash
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GCP_PROJECT_ID=your-project-id
BQ_DATASET=your-dataset-name
STREAM_TABLE=stream-table-name
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud AI Platform** - For Vertex AI and Gemini AI services
- **React Community** - For the amazing ecosystem and tools
- **Cement Industry Partners** - For domain expertise and requirements
- **Open Source Contributors** - For the libraries and frameworks used

---

Built with ❤️ for sustainable cement manufacturing optimization and made for JK Cement
