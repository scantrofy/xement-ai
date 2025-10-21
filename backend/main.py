import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from google.cloud import bigquery, firestore
from gemini_call import get_recommendation
from energy_verify import verify_energy_saving
from fuel_simulator import simulate_fuel_mix
import bcrypt
import secrets
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI()

# Configure CORS - Allow requests from frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://xement-ai.vercel.app",  # Production Vercel domain
        "https://*.vercel.app",           # Any Vercel preview deployments
        "http://localhost:4028",          # Local development (Vite default)
        "http://localhost:3000",          # Alternative local port
        "http://127.0.0.1:4028",         # Local IP variant
        "https://localhost:4028",         # HTTPS local (if used)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
) 

fs_client = firestore.Client(
    project=os.getenv("GCP_PROJECT_ID"),
    database=os.getenv("FIRESTORE_DB")
)
FIRESTORE_COLLECTION = os.getenv("FIRESTORE_DB")
USERS_COLLECTION = "users"
TOKENS_COLLECTION = "auth_tokens"

class PlantState(BaseModel):
    raw1_frac: float
    raw2_frac: float
    grinding_efficiency: float
    kiln_temp: float
    fan_speed: float
    energy_use: float

# Authentication Models
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization: str
    role: str  # 'admin' or 'operator'

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str

class AuthResponse(BaseModel):
    token: str
    user: dict

# Helper Functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

def get_user_by_email(email: str):
    """Get user from Firestore by email"""
    users_ref = fs_client.collection(USERS_COLLECTION)
    query = users_ref.where('email', '==', email).limit(1)
    docs = list(query.stream())
    if docs:
        user_data = docs[0].to_dict()
        user_data['id'] = docs[0].id
        return user_data
    return None

def create_auth_token(user_id: str, email: str, role: str) -> str:
    """Create and store authentication token in Firestore"""
    token = generate_token()
    token_data = {
        'token': token,
        'user_id': user_id,
        'email': email,
        'role': role,
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(days=7)
    }
    fs_client.collection(TOKENS_COLLECTION).document(token).set(token_data)
    return token

def verify_token(token: str):
    """Verify token and return user data"""
    try:
        token_doc = fs_client.collection(TOKENS_COLLECTION).document(token).get()
        if not token_doc.exists:
            return None
        
        token_data = token_doc.to_dict()
        # Check if token is expired
        if token_data['expires_at'] < datetime.utcnow():
            return None
        
        return token_data
    except Exception:
        return None

@app.get("/")
def root():
    return {"status": "Backend API running"}

@app.get("/latest_state")
def latest_state():
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `xement-ai.xement-ai-dataset.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No data found in serve_latest"}
        return dict(rows[0])
    except Exception as e:
        return {"error": f"BigQuery query failed: {str(e)}"}

@app.get("/history")
def history():
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `xement-ai.xement-ai-dataset.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 50
    """

    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No data found in serve_latest"}
        return [dict(r) for r in rows]
    except Exception as e:
        return {"error": f"BigQuery query failed: {str(e)}"}

@app.post("/recommendation")
def recommendation(state: PlantState):
    try:
        gemini_output = get_recommendation(state.dict())
        if not isinstance(gemini_output, dict):
            return {"error": "Gemini output not valid JSON"}
    except Exception as e:
        return {"error": f"Gemini call failed: {str(e)}"}

    # Prepare regression inputs
    vertex_input_original = state.dict()
    vertex_input_modified = vertex_input_original.copy()
    for rec in gemini_output.get('recommendations', []):
        try:
            vertex_input_modified[rec['parameter']] = rec['new_value']
        except KeyError:
            continue

    # Verify savings
    try:
        verified_saving = verify_energy_saving(vertex_input_original, vertex_input_modified)
    except Exception:
        verified_saving = None

    gemini_output['verified_saving_pct'] = verified_saving
    return gemini_output

@app.get("/simulate_fuel")
def simulate_fuel():
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `xement-ai.xement-ai-dataset.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No plant state available for simulation"}

        # Validate with PlantState model
        state_obj = PlantState(**dict(rows[0]))
        base_row = state_obj.dict()

        # Run simulator with BigQuery latest row
        simulation_results = simulate_fuel_mix(base_row)
        return {"simulation": simulation_results}

    except Exception as e:
        return {"error": f"Fuel simulation failed: {str(e)}"}

def check_anomalies(state_dict):
    anomalies = []
    if state_dict.get("grinding_efficiency", 100) < 82:
        anomalies.append("low_grinding_efficiency")
    if state_dict.get("kiln_temp", 0) > 1500:
        anomalies.append("high_kiln_temp")
    return {"anomaly_flag": len(anomalies) > 0, "anomalies": anomalies}

@app.post("/run_cycle")
def run_cycle():
    # Fetch latest state
    client = bigquery.Client()
    query = """
        SELECT * 
        FROM `xement-ai.xement-ai-dataset.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    try:
        rows = list(client.query(query))
        if not rows:
            return {"error": "No plant state available"}
        state_obj = PlantState(**dict(rows[0]))
        state = state_obj.dict()
    except Exception as e:
        return {"error": f"BigQuery query failed or validation error: {str(e)}"}

    # Run anomaly detection
    anomaly = check_anomalies(state)

    # Get Gemini recommendation
    try:
        gemini_output = get_recommendation(state)
        if not isinstance(gemini_output, dict):
            gemini_output = {"recommendations": []}
    except Exception as e:
        gemini_output = {"recommendations": [], "error": f"Gemini call failed: {str(e)}"}

    # Prepare inputs for energy verification
    vertex_input_original = state
    vertex_input_modified = vertex_input_original.copy()
    for rec in gemini_output.get('recommendations', []):
        try:
            vertex_input_modified[rec['parameter']] = rec['new_value']
        except KeyError:
            continue

    # Verify energy savings
    try:
        verified_saving = verify_energy_saving(vertex_input_original, vertex_input_modified)
    except Exception:
        verified_saving = None

    gemini_output['verified_saving_pct'] = verified_saving

    # Write to Firestore
    try:
        fs_doc = {
            "timestamp": state.get("timestamp"),
            "state": state,
            "anomaly": anomaly,
            "recommendation": gemini_output
        }
        fs_client.collection(FIRESTORE_COLLECTION).add(fs_doc)
        firestore_written = True
    except Exception as e:
        firestore_written = False
        gemini_output["firestore_error"] = str(e)

    # Return everything to UI
    return {
        "state": state,
        "anomaly": anomaly,
        "recommendation": gemini_output,
        "firestore_doc": firestore_written
    }

# ============= Authentication Endpoints =============

@app.post("/auth/signup")
def signup(user_data: UserSignup):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate role
        if user_data.role not in ['admin', 'operator']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'admin' or 'operator'"
            )
        
        # Hash password
        hashed_pw = hash_password(user_data.password)
        
        # Create user document
        user_doc = {
            'email': user_data.email,
            'password': hashed_pw,
            'full_name': user_data.full_name,
            'organization': user_data.organization,
            'role': user_data.role,
            'created_at': datetime.utcnow(),
            'is_active': True
        }
        
        # Save to Firestore
        doc_ref = fs_client.collection(USERS_COLLECTION).add(user_doc)
        user_id = doc_ref[1].id
        
        # Create auth token
        token = create_auth_token(user_id, user_data.email, user_data.role)
        
        # Return user data (without password)
        return {
            "token": token,
            "user": {
                "id": user_id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "organization": user_data.organization,
                "role": user_data.role
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )

@app.post("/auth/login")
def login(credentials: UserLogin):
    """Authenticate user and return token"""
    try:
        # Get user from database
        user = get_user_by_email(credentials.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user['password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get('is_active', True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Verify role matches
        if user['role'] != credentials.role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid credentials for {credentials.role} role"
            )
        
        # Create auth token
        token = create_auth_token(user['id'], user['email'], user['role'])
        
        # Return user data (without password)
        return {
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "full_name": user.get('full_name', ''),
                "organization": user.get('organization', ''),
                "role": user['role']
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@app.get("/auth/me")
def get_current_user(token: str):
    """Get current user data from token"""
    try:
        token_data = verify_token(token)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # Get user data
        user = get_user_by_email(token_data['email'])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "user": {
                "id": user['id'],
                "email": user['email'],
                "full_name": user.get('full_name', ''),
                "organization": user.get('organization', ''),
                "role": user['role']
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}"
        )

@app.post("/auth/logout")
def logout(token: str):
    """Logout user by invalidating token"""
    try:
        # Delete token from Firestore
        fs_client.collection(TOKENS_COLLECTION).document(token).delete()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )