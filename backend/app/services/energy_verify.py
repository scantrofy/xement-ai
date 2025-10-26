from .vertex_service import predict_energy
import logging

def verify_energy_saving(original: dict, recommended: dict) -> float:
    try:
        orig_e = predict_energy(original)
        rec_e = predict_energy(recommended)
        if orig_e <= 0:
            return None
        return round(100.0 * (orig_e - rec_e) / orig_e, 3)
    except Exception as e:
        logging.error(f"Energy verification failed: {e}")
        return None
