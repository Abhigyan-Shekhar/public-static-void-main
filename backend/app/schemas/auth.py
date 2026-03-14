from pydantic import BaseModel

from app.core.security import Role


class LoginRequest(BaseModel):
    role: Role
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    username: str
    display_name: str | None = None
    case_id: str | None = None
    redirect_to: str
