"""Auth routes — login and token generation."""

from fastapi import APIRouter, HTTPException, status

from app.core.security import authenticate_user, create_access_token, Role
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    user = authenticate_user(body.role, body.username, body.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    redirect_to = "/dashboard"
    if user.role == Role.REFUGEE:
        redirect_to = "/refugee"
    elif user.role == Role.PARTNER:
        redirect_to = "/referrals"

    token = create_access_token(
        {
            "sub": body.username,
            "username": body.username,
            "uid": user.id,
            "role": user.role.value,
            "display_name": user.display_name,
            "case_id": user.case_id,
        }
    )
    return LoginResponse(
        access_token=token,
        role=user.role,
        username=body.username,
        display_name=user.display_name,
        case_id=user.case_id,
        redirect_to=redirect_to,
    )
