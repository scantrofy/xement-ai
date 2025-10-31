import google.generativeai as genai
import os
from datetime import datetime
from google.cloud import bigquery
import logging

logger = logging.getLogger("xement-ai")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# BigQuery client
bq_client = bigquery.Client()
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "xement-ai")
DATASET_ID = "xement_ai_dataset"
TABLE_ID = "serve_latest"

# System prompt for XementAI Assistant
SYSTEM_PROMPT = """You are XementAI Assistant, an expert AI-powered assistant for cement plant operations at XementAI.

Your Expertise:
- Deep understanding of cement manufacturing processes (clinker production, grinding, kiln operations)
- Real-time monitoring of plant KPIs (energy, emissions, quality, efficiency, temperature, feed rates)
- Anomaly detection and root cause analysis
- Optimization recommendations for energy savings and sustainability
- Fuel simulation and alternative fuel impact analysis
- Multi-objective optimization (balancing quality, energy, and emissions)

Your Capabilities:
1. **Data Analysis**: Interpret real-time BigQuery data (serve_latest, training_data)
2. **Anomaly Explanation**: Analyze alerts from Firestore and explain causes
3. **Optimization**: Suggest parameter adjustments with quantified impact
4. **Simulation**: Evaluate alternative fuel scenarios (TSR, RDF, biomass)
5. **Trend Analysis**: Compare current vs historical performance
6. **Conversational Context**: Remember previous queries in the conversation
7. **Technical Reasoning**: Explain cement process relationships (e.g., kiln temp vs energy)

Communication Style:
- Be concise and direct - keep responses to 2-3 short paragraphs maximum
- Lead with the answer, then brief supporting details if needed
- Always cite actual numbers from the data when available
- Use bullet points for lists instead of long paragraphs
- Avoid lengthy explanations unless specifically asked
- No emojis unless the user's message uses them
- If data is missing, briefly state what's available

Context Format:
You will receive current plant data, recent anomalies, and user role information with each query.
Use this context to provide accurate, grounded responses.
"""

def get_plant_context():
    """Fetch latest plant data from BigQuery for context"""
    try:
        full_table = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
        logger.info(f"Fetching plant context from BigQuery: {full_table}")
        
        query = f"""
        SELECT 
            timestamp,
            energy_use,
            emissions_CO2,
            grinding_efficiency,
            product_quality_index,
            kiln_temp,
            fan_speed,
            feed_rate
        FROM `{full_table}`
        ORDER BY timestamp DESC
        LIMIT 1
        """
        
        query_job = bq_client.query(query)
        results = list(query_job.result())
        logger.info(f"BigQuery returned {len(results)} rows")
        
        if results:
            row = results[0]
            plant_data = {
                "timestamp": row.timestamp.isoformat() if row.timestamp else None,
                "energy_use": float(row.energy_use) if row.energy_use else None,
                "emissions_CO2": float(row.emissions_CO2) if row.emissions_CO2 else None,
                "grinding_efficiency": float(row.grinding_efficiency) if row.grinding_efficiency else None,
                "product_quality": float(row.product_quality_index) if row.product_quality_index else None,
                "kiln_temp": float(row.kiln_temp) if row.kiln_temp else None,
                "fan_speed": float(row.fan_speed) if row.fan_speed else None,
                "feed_rate": float(row.feed_rate) if row.feed_rate else None
            }
            logger.info(f"Successfully fetched plant data: {plant_data}")
            return plant_data
        else:
            logger.warning("No results returned from BigQuery")
            return None
    except Exception as e:
        logger.error(f"Error fetching plant context: {str(e)}", exc_info=True)
        return None

async def get_recent_anomalies():
    """Fetch recent anomalies from Firestore"""
    try:
        from app.services.firestore_service import fs_client
        
        alerts_ref = fs_client.collection("alerts")
        query = alerts_ref.where("acknowledged", "==", False).limit(10)
        docs = query.stream()
        
        anomalies = []
        for doc in docs:
            data = doc.to_dict()
            anomalies.append({
                "severity": data.get("severity"),
                "anomalies": data.get("anomalies", []),
                "timestamp": data.get("timestamp")
            })
        
        anomalies.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return anomalies[:5]  # Return top 5
    except Exception as e:
        logger.error(f"Error fetching anomalies: {str(e)}")
        return []

def build_context_string(plant_data, anomalies):
    """Build comprehensive context string for Gemini"""
    context_parts = []
    
    if plant_data:
        context_parts.append("=== CURRENT PLANT STATUS ===")
        context_parts.append(f"Timestamp: {plant_data.get('timestamp', 'N/A')}")
        context_parts.append("")
        context_parts.append("**Key Performance Indicators:**")
        context_parts.append(f"• Energy Use: {plant_data.get('energy_use', 'N/A')} kWh/ton")
        context_parts.append(f"• CO2 Emissions: {plant_data.get('emissions_CO2', 'N/A')} kg/ton")
        context_parts.append(f"• Grinding Efficiency: {plant_data.get('grinding_efficiency', 'N/A')}%")
        context_parts.append(f"• Product Quality Index: {plant_data.get('product_quality', 'N/A')}")
        context_parts.append("")
        context_parts.append("**Operational Parameters:**")
        context_parts.append(f"• Kiln Temperature: {plant_data.get('kiln_temp', 'N/A')}°C")
        context_parts.append(f"• Fan Speed: {plant_data.get('fan_speed', 'N/A')}%")
        context_parts.append(f"• Feed Rate: {plant_data.get('feed_rate', 'N/A')} tons/hr")
        context_parts.append("")
    
    if anomalies:
        context_parts.append("=== RECENT ANOMALIES & ALERTS ===")
        for i, anomaly in enumerate(anomalies[:5], 1):
            severity = anomaly.get('severity', 'unknown')
            anomaly_list = anomaly.get('anomalies', [])
            timestamp = anomaly.get('timestamp', 'N/A')
            context_parts.append(f"{i}. [{severity.upper()}] {', '.join(anomaly_list)}")
            context_parts.append(f"   Time: {timestamp}")
        context_parts.append("")
    else:
        context_parts.append("=== RECENT ANOMALIES & ALERTS ===")
        context_parts.append("✅ No recent anomalies detected. Plant operating normally.")
        context_parts.append("")
    
    context_parts.append("=== AVAILABLE ACTIONS ===")
    context_parts.append("• View detailed KPI trends and historical data")
    context_parts.append("• Run fuel simulation scenarios (alternative fuel impact)")
    context_parts.append("• Get AI-powered optimization recommendations")
    context_parts.append("• Analyze anomaly root causes and solutions")
    context_parts.append("• Compare performance across shifts and time periods")
    
    return "\n".join(context_parts)

def generate_fallback_response(message: str, plant_data: dict, anomalies: list):
    """Generate a helpful fallback response without AI when Gemini is not configured"""
    message_lower = message.lower()
    
    # Handle KPI requests
    if any(word in message_lower for word in ['kpi', 'status', 'current', 'latest', 'show']):
        if plant_data:
            return f"""Here are the latest KPIs from the plant:

📊 **Current Status:**
• Energy Use: {plant_data.get('energy_use', 'N/A')} kWh/ton
• CO2 Emissions: {plant_data.get('emissions_CO2', 'N/A')} kg/ton
• Grinding Efficiency: {plant_data.get('grinding_efficiency', 'N/A')}%
• Product Quality: {plant_data.get('product_quality', 'N/A')}
• Kiln Temperature: {plant_data.get('kiln_temp', 'N/A')}°C
• Fan Speed: {plant_data.get('fan_speed', 'N/A')}%
• Feed Rate: {plant_data.get('feed_rate', 'N/A')} tons/hr

For more detailed analysis, visit the Overview Dashboard."""
        else:
            return f"""I couldn't fetch the latest KPIs from BigQuery. 

**Debug Info:**
- Project: {PROJECT_ID}
- Dataset: {DATASET_ID}
- Table: {TABLE_ID}

Please check:
1. BigQuery table exists and has data
2. Service account has permissions
3. Backend logs for detailed error

You can view data on the Overview Dashboard."""
    
    # Handle anomaly requests
    if any(word in message_lower for word in ['anomaly', 'anomalies', 'alert', 'issue', 'problem']):
        if anomalies:
            anomaly_text = "\n".join([
                f"• {a.get('severity', 'unknown').upper()}: {', '.join(a.get('anomalies', []))}"
                for a in anomalies[:3]
            ])
            return f"""⚠️ **Recent Anomalies Detected:**

{anomaly_text}

Visit the Alerts & Anomalies Monitor page for detailed recommendations."""
        else:
            return "✅ No recent anomalies detected. The plant is operating within normal parameters."
    
    # Handle simulation requests
    if any(word in message_lower for word in ['simulate', 'simulation', 'fuel', 'alt fuel']):
        return """To run a fuel simulation:

1. Navigate to the **Scenario Simulator** page
2. Adjust the Alternative Fuel % slider
3. Click **Run Simulation**

The simulator will show you the impact on energy consumption, emissions, and costs."""
    
    # Handle recommendation requests
    if any(word in message_lower for word in ['recommend', 'suggestion', 'optimize', 'improve']):
        return """For AI-powered recommendations:

1. Visit the **AI Recommendations Engine** page
2. Click **Run AI Cycle** to generate fresh recommendations
3. Review the optimization suggestions based on current plant data

The AI will analyze your plant's performance and suggest actionable improvements."""
    
    # Default response
    return f"""I can help you with:

• **Show latest KPIs** - View current plant performance metrics
• **Explain anomalies** - Check recent alerts and issues
• **Run simulations** - Test different fuel scenarios
• **Get recommendations** - Access AI-powered optimization suggestions

You can also navigate to specific pages in the dashboard for detailed analysis."""

async def process_chat_message(message: str, user_id: str, user_name: str, context: dict = None):
    """Process chat message with Gemini AI"""
    try:
        logger.info(f"Processing chat message: {message}")
        plant_data = get_plant_context() 
        logger.info(f"Plant data fetched: {plant_data is not None}")
        
        anomalies = await get_recent_anomalies()
        logger.info(f"Anomalies fetched: {len(anomalies) if anomalies else 0}")
        
        context_string = build_context_string(plant_data, anomalies)
        
        full_prompt = f"""{SYSTEM_PROMPT}

{context_string}

=== USER QUERY ===
{message}

=== INSTRUCTIONS ===
1. **BE CONCISE**: Keep your response to 2-3 short paragraphs or a brief bulleted list
2. **LEAD WITH THE ANSWER**: Start with the direct answer, then add supporting details only if essential
3. **USE ACTUAL DATA**: Always cite specific numbers from the plant status when answering
4. **NO FLUFF**: Avoid introductory phrases like "Understood!" or "Great question!" - just answer
5. **BULLET POINTS**: Use bullets for lists, not long paragraphs
6. **ACTIONABLE**: If suggesting actions, be specific and brief
7. **SKIP OBVIOUS**: Don't explain basic concepts unless asked
8. **OFF-TOPIC QUESTIONS**: If asked about something unrelated to cement plant operations (like playing songs, weather, jokes, etc.), respond with ONLY: "I am XementAI Assistant, an expert AI for cement plant operations. I can only help with plant monitoring, KPIs, anomalies, optimization, and simulations."

Examples of good responses:
- "Current energy use is 163.57 kWh/ton. To reduce it: decrease kiln temp by 10°C or increase fan speed to 90%."
- "Simulating 30% alt fuel would reduce CO2 by ~15-20% and energy cost by 10-12%. Run /simulate_fuel for exact numbers."
- "2 critical alerts: high energy (163.57 > 160) and low quality (76.69 < 80). Check kiln temp and feed rate."
- For off-topic: "I am XementAI Assistant, an expert AI for cement plant operations. I can only help with plant monitoring, KPIs, anomalies, optimization, and simulations."

Respond now:
"""
        
        logger.info(f"GEMINI_API_KEY configured: {bool(GEMINI_API_KEY)}")
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured - using fallback")
            fallback_response = generate_fallback_response(message, plant_data, anomalies)
            return {
                "response": fallback_response,
                "model": "fallback",
                "context_used": bool(plant_data or anomalies),
                "timestamp": datetime.utcnow().isoformat()
            }
        
        try:
            logger.info("Calling Gemini API...")
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(full_prompt)
            
            logger.info(f"Gemini response received: {len(response.text)} characters")
            
            return {
                "response": response.text,
                "model": "gemini-pro",
                "context_used": bool(plant_data or anomalies),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as gemini_error:
            logger.error(f"Gemini API error: {str(gemini_error)}", exc_info=True)
            fallback_response = generate_fallback_response(message, plant_data, anomalies)
            return {
                "response": fallback_response,
                "model": "fallback-error",
                "context_used": bool(plant_data or anomalies),
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(gemini_error)
            }
        
    except Exception as e:
        logger.error(f"Error in chatbot service: {str(e)}")
        
        return {
            "response": f"I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.",
            "model": "error-fallback",
            "context_used": False,
            "timestamp": datetime.utcnow().isoformat()
        }
