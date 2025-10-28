"""
Test script to check anomaly detection manually
Run this to see what data BigQuery has and what anomalies should be detected
"""
from google.cloud import bigquery
from app.services.anomaly_detector import check_anomalies_with_thresholds
from app.routers.config_router import DEFAULT_THRESHOLDS

def test_anomaly_detection():
    print("=" * 80)
    print("TESTING ANOMALY DETECTION")
    print("=" * 80)
    
    # Fetch latest state from BigQuery
    bq_client = bigquery.Client()
    
    # First, let's check what datasets exist
    print("\nChecking available datasets...")
    datasets = list(bq_client.list_datasets())
    if datasets:
        print(f"Found {len(datasets)} dataset(s):")
        for dataset in datasets:
            print(f"   - {dataset.dataset_id}")
            
            # List tables in xement_ai_dataset
            if dataset.dataset_id == "xement_ai_dataset":
                print(f"\n   Tables in {dataset.dataset_id}:")
                tables = list(bq_client.list_tables(f"xement-ai.{dataset.dataset_id}"))
                if tables:
                    for table in tables:
                        print(f"      - {table.table_id}")
                else:
                    print(f"      (no tables found)")
    else:
        print("   No datasets found!")
        return
    
    query = """
        SELECT *
        FROM `xement-ai.xement_ai_dataset.serve_latest`
        ORDER BY timestamp DESC
        LIMIT 1
    """
    
    print("\n1. Fetching latest data from BigQuery...")
    result = bq_client.query(query).result()
    rows = list(result)
    
    if not rows:
        print("❌ No data found in BigQuery!")
        return
    
    latest_state = dict(rows[0])
    print(f"✅ Found data from: {latest_state.get('timestamp')}")
    
    # Print relevant values
    print("\n2. Current Plant State:")
    print(f"   - Energy Use: {latest_state.get('energy_use')} kWh/ton")
    print(f"   - Grinding Efficiency: {latest_state.get('grinding_efficiency')}%")
    print(f"   - Kiln Temp: {latest_state.get('kiln_temp')}°C")
    print(f"   - Emissions CO2: {latest_state.get('emissions_CO2')} kg/ton")
    print(f"   - Product Quality Index: {latest_state.get('product_quality_index')}")
    print(f"   - Fan Speed: {latest_state.get('fan_speed')}%")
    print(f"   - Feed Rate: {latest_state.get('feed_rate')}")
    
    # Print thresholds
    print("\n3. Anomaly Thresholds:")
    print(f"   - Energy Use: Warning > {DEFAULT_THRESHOLDS['energy_use']['warning_max']}, Critical > {DEFAULT_THRESHOLDS['energy_use']['critical_max']}")
    print(f"   - Grinding Efficiency: Warning < {DEFAULT_THRESHOLDS['grinding_efficiency']['warning_min']}, Critical < {DEFAULT_THRESHOLDS['grinding_efficiency']['critical_min']}")
    print(f"   - Kiln Temp: Warning > {DEFAULT_THRESHOLDS['kiln_temp']['warning_max']} or < {DEFAULT_THRESHOLDS['kiln_temp']['warning_min']}, Critical > {DEFAULT_THRESHOLDS['kiln_temp']['critical_max']}")
    print(f"   - Product Quality: Warning < {DEFAULT_THRESHOLDS['product_quality_index']['warning_min']}, Critical < {DEFAULT_THRESHOLDS['product_quality_index']['critical_min']}")
    
    # Check for anomalies
    print("\n4. Running Anomaly Detection...")
    anomaly_result = check_anomalies_with_thresholds(latest_state)
    
    print(f"\n5. Results:")
    print(f"   - Anomaly Flag: {anomaly_result['anomaly_flag']}")
    print(f"   - Severity: {anomaly_result['severity']}")
    print(f"   - Total Anomalies: {len(anomaly_result['anomalies'])}")
    
    if anomaly_result['anomalies']:
        print(f"\n   🚨 Anomalies Detected:")
        for anomaly in anomaly_result['anomalies']:
            severity = "CRITICAL" if anomaly in anomaly_result['critical_anomalies'] else "WARNING"
            print(f"      - [{severity}] {anomaly}")
    else:
        print(f"\n   ✅ No anomalies detected - all systems normal")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    test_anomaly_detection()
