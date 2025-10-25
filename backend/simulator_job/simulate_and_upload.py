"""
simulate_and_upload.py

Simulate an expanded cement plant time-series dataset and upload to BigQuery.

Configurable:
 - PROJECT: GCP project id
 - BQ_DATASET: BigQuery dataset (e.g. cement_ops)
 - TABLE: BigQuery table name (will be created if not exists)
 - NUM_ROWS: total number of simulated rows
 - PLANTS: list of plant ids/names to simulate
 - MODE: 'bulk' (single dataframe load) or 'stream' (periodic small inserts to simulate streaming)
"""

import os
import math
import random
from datetime import datetime, timedelta, timezone
import pandas as pd
import numpy as np
from dateutil import tz
from google.cloud import bigquery
from google.api_core.exceptions import NotFound

# ---------------- CONFIGS ----------------
PROJECT = os.getenv("GCP_PROJECT_ID", "xement-ai")
BQ_DATASET = os.getenv("BQ_DATASET", "xement_ai_dataset")
BQ_DATASET_LOCATION = os.getenv("BQ_DATASET_LOCATION", "US")
BQ_TABLE = os.getenv("BQ_TABLE", "xement_ai_refinement_data")
NUM_ROWS = int(os.getenv("NUM_ROWS", "20000"))
PLANTS = os.getenv("PLANTS", "PlantA,PlantB,PlantC").split(",")
START_TS = os.getenv("START_TS")  # optional ISO string if None, now - NUM_ROWS*interval
FREQ_MINUTES = int(os.getenv("SIMULATE_FREQ_MINUTES", "5"))
MODE = os.getenv("SIMULATE_MODE", "bulk")  # mode can be bulk or stream
BATCH_SIZE = int(os.getenv("SIMULATE_BATCH_SIZE", "500"))  # used in stream mode
# ----------------------------------------

# Emission factors (kg CO2 per kWh) and defaults (rough plausible numbers)
EMISSION_FACTORS = {"fossil": 0.85, "biomass": 0.10, "rdf": 0.20}
FOSSIL_BASE_SHARE = 0.8
ALT_FUEL_TYPES = ["biomass", "rdf"]

# BigQuery client
client = bigquery.Client(project=PROJECT)

def ensure_dataset_and_table():
    dataset_ref = client.dataset(BQ_DATASET)
    try:
        client.get_dataset(dataset_ref)
    except NotFound:
        print(f"Dataset {BQ_DATASET} not found. Creating it.")
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = BQ_DATASET_LOCATION
        client.create_dataset(dataset)
    table_ref = dataset_ref.table(BQ_TABLE)
    try:
        client.get_table(table_ref)
        print(f"Table {BQ_DATASET}.{BQ_TABLE} exists.")
    except NotFound:
        print(f"Table {BQ_DATASET}.{BQ_TABLE} not found. Creating table with schema.")
        schema = [
            bigquery.SchemaField("timestamp", "TIMESTAMP"),
            bigquery.SchemaField("plant_id", "STRING"),
            bigquery.SchemaField("raw1_frac", "FLOAT"),
            bigquery.SchemaField("raw2_frac", "FLOAT"),
            bigquery.SchemaField("grinding_efficiency", "FLOAT"),
            bigquery.SchemaField("kiln_temp", "FLOAT"),
            bigquery.SchemaField("fan_speed", "FLOAT"),
            bigquery.SchemaField("mill_speed", "FLOAT"),
            bigquery.SchemaField("feed_rate", "FLOAT"),
            bigquery.SchemaField("clinker_rate", "FLOAT"),
            bigquery.SchemaField("alt_fuel_pct", "FLOAT"),
            bigquery.SchemaField("fuel_type", "STRING"),
            bigquery.SchemaField("energy_use", "FLOAT"),
            bigquery.SchemaField("emissions_CO2", "FLOAT"),
            bigquery.SchemaField("product_quality_index", "FLOAT"),
            bigquery.SchemaField("anomaly_flag", "BOOLEAN"),
            bigquery.SchemaField("notes", "STRING"),
        ]
        table = bigquery.Table(table_ref, schema=schema)
        client.create_table(table)
        print(f"Created table {BQ_DATASET}.{BQ_TABLE}")


def simulate_row(ts, plant_id):
    """
    Generate a realistic plant state row.
    Relationships:
      - energy_use increases with kiln temp & feed_rate and decreases with grinding_efficiency.
      - alt_fuel reduces emissions and slightly affects energy.
      - product quality correlates with grinding_efficiency and raw mix variation.
    """
    # Base operating envelopes per plant (slightly different baselines)
    base_kiln = random.uniform(1400, 1480) + (hash(plant_id) % 30) * 0.1
    base_grind_eff = random.uniform(78, 92)
    base_feed = random.uniform(90, 110)  # tons/hour
    base_clinker = base_feed * random.uniform(0.7, 0.9)

    # Random small fluctuations
    kiln_temp = base_kiln + np.random.normal(0, 10)
    grinding_efficiency = max(65.0, min(98.0, base_grind_eff + np.random.normal(0, 3)))
    fan_speed = max(60.0, min(100.0, 80 + np.random.normal(0, 5)))
    mill_speed = max(10.0, min(40.0, 25 + np.random.normal(0, 3)))
    feed_rate = max(60.0, base_feed + np.random.normal(0, 5))
    clinker_rate = max(40.0, base_clinker + np.random.normal(0, 3))

    # Random raw mix ratios that sum to 1 for two components
    raw1 = round(random.choice([0.68, 0.70, 0.72, 0.66]) + np.random.normal(0, 0.01), 3)
    raw2 = round(1.0 - raw1, 3)

    # Alternative fuel percent (0-60)
    alt_fuel_pct = float(max(0, min(60, np.random.choice([0, 5, 10, 20, 30, 40, 50]) + np.random.normal(0, 2))))

    # Choose fuel type weighted by alt_fuel_pct
    if alt_fuel_pct < 5:
        fuel_type = "fossil"
    else:
        fuel_type = random.choice(ALT_FUEL_TYPES + ["fossil"])

    # Heuristic energy calculation (kWh/ton).
    # energy depends on kiln_temp (higher => more energy), lower grind_eff => more energy, and alt_fuel reduces/increases slightly
    base_energy = 180.0  # baseline kWh/ton
    temp_factor = 0.02 * (kiln_temp - 1400)  # per degree
    grind_factor = -0.8 * (grinding_efficiency - 80) / 10.0
    feed_factor = 0.05 * (feed_rate - 100) / 10.0
    alt_factor = -0.0025 * alt_fuel_pct  # each % alt reduces energy slightly (tunable)
    noise = np.random.normal(0, 3)
    energy_use = base_energy * (1 + temp_factor/100.0 + grind_factor/100.0 + feed_factor/100.0 + alt_factor) + noise
    energy_use = max(120.0, energy_use)  # sanity

    # Emissions (kg CO2 per ton) based on fuel shares
    fossil_frac = max(0.0, 1.0 - (alt_fuel_pct / 100.0))
    # Simplified: emissions = energy_use * (weighted emission factor)
    emission_factor = fossil_frac * EMISSION_FACTORS["fossil"] + (1 - fossil_frac) * 0.15
    emissions_CO2 = energy_use * emission_factor

    # Product quality index (0-100) — depends on grinding efficiency and raw mix stability
    quality_noise = np.random.normal(0, 2)
    product_quality_index = 75 + 0.3 * (grinding_efficiency - 80) - 5 * abs(raw1 - 0.7) + quality_noise
    product_quality_index = round(max(40.0, min(100.0, product_quality_index)), 2)

    # Anomaly injection: occasional anomalies
    anomaly_flag = False
    notes = ""
    if kiln_temp > 1520 or grinding_efficiency < 72 or np.random.rand() < 0.005:
        anomaly_flag = True
        notes = "auto-detected anomaly: " + (
            "high_kiln_temp" if kiln_temp > 1520 else "low_grinding_efficiency"
        )

    row = {
        "timestamp": ts.isoformat(),
        "plant_id": plant_id,
        "raw1_frac": float(raw1),
        "raw2_frac": float(raw2),
        "grinding_efficiency": float(round(grinding_efficiency, 2)),
        "kiln_temp": float(round(kiln_temp, 1)),
        "fan_speed": float(round(fan_speed, 1)),
        "mill_speed": float(round(mill_speed, 1)),
        "feed_rate": float(round(feed_rate, 2)),
        "clinker_rate": float(round(clinker_rate, 2)),
        "alt_fuel_pct": float(round(alt_fuel_pct, 2)),
        "fuel_type": fuel_type,
        "energy_use": float(round(energy_use, 3)),
        "emissions_CO2": float(round(emissions_CO2, 3)),
        "product_quality_index": float(product_quality_index),
        "anomaly_flag": bool(anomaly_flag),
        "notes": notes,
    }
    return row


def generate_dataframe(num_rows=NUM_ROWS, freq_minutes=FREQ_MINUTES, plants=PLANTS, start_ts=None):
    if start_ts:
        start = pd.to_datetime(start_ts).tz_convert(tz.UTC)
    else:
        # compute a start timestamp such that last row is now
        start = pd.Timestamp.now(tz=timezone.utc) - pd.Timedelta(minutes=(num_rows // len(plants)) * freq_minutes)
    rows = []
    ts = start
    idx = 0
    # distribute rows across plants sequentially to create interleaved time series
    while idx < num_rows:
        for plant in plants:
            if idx >= num_rows:
                break
            row = simulate_row(ts, plant)
            rows.append(row)
            ts = ts + pd.Timedelta(minutes=freq_minutes)
            idx += 1
    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    numeric_cols = [
        "raw1_frac", "raw2_frac", "grinding_efficiency", "kiln_temp", "fan_speed",
        "mill_speed", "feed_rate", "clinker_rate", "alt_fuel_pct", "energy_use",
        "emissions_CO2", "product_quality_index"
    ]
    df[numeric_cols] = df[numeric_cols].astype(float)
    df["anomaly_flag"] = df["anomaly_flag"].astype(bool)
    return df


def upload_dataframe_to_bq(df, project=PROJECT, dataset=BQ_DATASET, table=BQ_TABLE):
    table_id = f"{project}.{dataset}.{table}"
    job_config = bigquery.LoadJobConfig(
        write_disposition="WRITE_APPEND",
        source_format=bigquery.SourceFormat.PARQUET,
    )
    print(f"Loading {len(df)} rows to {table_id} ...")
    job = client.load_table_from_dataframe(df, table_id, job_config=job_config)
    job.result() 
    print(f"Loaded {len(df)} rows to {table_id}.")


def stream_to_bq(df, project=PROJECT, dataset=BQ_DATASET, table=BQ_TABLE, batch_size=BATCH_SIZE):
    """
    Insert rows using insert_rows_json in small batches (real-time simulation)
    """
    table_id = f"{project}.{dataset}.{table}"
    rows = df.to_dict(orient="records")
    total = len(rows)
    for i in range(0, total, batch_size):
        batch = rows[i:i + batch_size]
        errors = client.insert_rows_json(table_id, batch)
        if errors:
            print(f"Errors inserting batch {i}-{i+batch_size}: {errors}")
        else:
            print(f"Inserted batch {i}-{i+len(batch)}")
    print("Streaming complete.")


def main():
    print("Starting simulation & upload process...")
    ensure_dataset_and_table()
    print("Generating dataframe ...")
    df = generate_dataframe()
    print("Sample rows:")
    print(df.head(3).to_dict(orient="records"))
    if MODE == "bulk":
        upload_dataframe_to_bq(df)
    else:
        stream_to_bq(df)
    print("Done.")


if __name__ == "__main__":
    main()
