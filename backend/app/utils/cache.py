import redis
import json
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.Redis.from_url(REDIS_URL)

def get_latest_state_cached():
    cached_data = redis_client.get("latest_state")
    if cached_data:
        return json.loads(cached_data)

    from app.services.bq_service import fetch_latest_state
    data = fetch_latest_state()

    redis_client.setex("latest_state", 60, json.dumps(data))
    return data
