# backend/app/core/deps.py
from typing import Annotated

from fastapi import Depends, Header, HTTPException

from app.core.security import (
    Permission,
    User,
    decode_access_token,
    get_demo_user,
    user_from_claims,
)


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    x_demo_username: Annotated[str, Header()] = "auth_manager",
) -> User:
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
        user = user_from_claims(decode_access_token(token))
        if user:
            return user
        raise HTTPException(status_code=401, detail="Invalid or expired bearer token.")

    user = get_demo_user(x_demo_username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Demo Username provided in X-Demo-Username header.")
    return user


def require_permission(required_permission: Permission):
    def permission_checker(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if required_permission not in current_user.permissions:
            raise HTTPException(status_code=403, detail=f"User does not have required permission: {required_permission.value}")
        return current_user
    return permission_checker

async def get_scoring_service():
    from app.services.scoring_service import ScoringService
    return ScoringService()
