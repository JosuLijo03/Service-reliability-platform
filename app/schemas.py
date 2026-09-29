from pydantic import BaseModel, ConfigDict


class ServiceCreate(BaseModel):
    name: str
    url: str
    check_interval: int = 30


class ServiceResponse(BaseModel):
    id: int
    name: str
    url: str
    check_interval: int

    model_config = ConfigDict(from_attributes=True)