from pydantic import BaseModel

class PlantState(BaseModel):
    raw1_frac: float
    raw2_frac: float
    grinding_efficiency: float
    kiln_temp: float
    fan_speed: float
    energy_use: float