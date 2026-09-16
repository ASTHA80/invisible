from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=200)


class User(BaseModel):
    id: int
    name: str
    email: str


class ObservationCreate(BaseModel):
    user_id: int
    text: str = Field(min_length=1, max_length=1000)


class Observation(BaseModel):
    id: int
    user_id: int
    text: str
    category: str
    friction: str
    keywords: list[str]
    created_at: str


class InterventionCreate(BaseModel):
    user_id: int
    problem_id: int
    action: str = Field(min_length=1, max_length=1000)


class Intervention(BaseModel):
    id: int
    user_id: int
    problem_id: int
    action: str
    status: str
    created_at: str
