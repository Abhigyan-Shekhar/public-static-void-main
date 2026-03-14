from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path

from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings


class Role(str, Enum):
    REFUGEE = "refugee"
    AUTHORITY = "authority"
    PARTNER = "partner"


class Permission(str, Enum):
    INTAKE_OFFICER = "intake_officer"
    REVIEWER = "reviewer"
    CASE_MANAGER = "case_manager"
    COMMUNICATIONS_PUBLISHER = "communications_publisher"
    PARTNER_SERVICE_OFFICER = "partner_service_officer"
    READ_ONLY_SELF_SERVICE = "read_only_self_service"


class User(BaseModel):
    id: str
    username: str
    role: Role
    permissions: list[Permission]
    display_name: str | None = None
    case_id: str | None = None


SECRET_KEY = settings.JWT_SECRET
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12
DEFAULT_BORDER_OFFICE_CODE = "117"


DEMO_USERS: dict[str, User] = {
    "auth_intake": User(
        id="auth_intake_1",
        username="auth_intake",
        role=Role.AUTHORITY,
        permissions=[Permission.INTAKE_OFFICER],
        display_name="Officer Intake",
    ),
    "auth_reviewer": User(
        id="auth_reviewer_1",
        username="auth_reviewer",
        role=Role.AUTHORITY,
        permissions=[Permission.REVIEWER],
        display_name="Officer Reviewer",
    ),
    "auth_manager": User(
        id="auth_manager_1",
        username="auth_manager",
        role=Role.AUTHORITY,
        permissions=[
            Permission.CASE_MANAGER,
            Permission.REVIEWER,
            Permission.INTAKE_OFFICER,
            Permission.COMMUNICATIONS_PUBLISHER,
        ],
        display_name="Officer Manager",
    ),
    "auth_publisher": User(
        id="auth_publisher_1",
        username="auth_publisher",
        role=Role.AUTHORITY,
        permissions=[Permission.COMMUNICATIONS_PUBLISHER],
        display_name="Officer Publisher",
    ),
    "partner_user": User(
        id="partner_user_1",
        username="partner_user",
        role=Role.PARTNER,
        permissions=[Permission.PARTNER_SERVICE_OFFICER],
        display_name="Relief Partner Desk",
    ),
    "refugee_user": User(
        id="refugee_user_1",
        username="refugee_user",
        role=Role.REFUGEE,
        permissions=[Permission.READ_ONLY_SELF_SERVICE],
        display_name="Refugee User",
    ),
}


AUTHORITY_ACCOUNTS = {
    "officer.portal": {
        "password": "secureOfficer117",
        "user": DEMO_USERS["auth_manager"],
    },
    "review.team": {
        "password": "reviewTeam117",
        "user": DEMO_USERS["auth_reviewer"],
    },
}


PARTNER_ACCOUNTS = {
    "partner.desk": {
        "password": "partnerAccess117",
        "user": DEMO_USERS["partner_user"],
    },
}


def _seed_path() -> Path:
    return Path(__file__).resolve().parents[3] / "data" / "seed" / "cases.json"


def _load_cases() -> list[dict]:
    import json

    path = _seed_path()
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def _clean_name(value: str) -> str:
    letters = "".join(ch for ch in value.lower() if ch.isalpha())
    return (letters[:3] or "ref").ljust(3, "x")


def refugee_username(name: str, birth_date: str) -> str:
    year = birth_date[:4]
    return f"{_clean_name(name)}{year}"


def refugee_password(name: str, birth_date: str, office_code: str = DEFAULT_BORDER_OFFICE_CODE) -> str:
    digits = "".join(ch for ch in birth_date if ch.isdigit())
    return f"{_clean_name(name)}{office_code}{digits}"


def authenticate_refugee(username: str, password: str) -> User | None:
    for item in _load_cases():
        person = item.get("person", {})
        name = str(person.get("name", ""))
        birth_date = str(person.get("date_of_birth", ""))
        if not name or not birth_date:
            continue
        if username == refugee_username(name, birth_date) and password == refugee_password(name, birth_date):
            case_id = str(item.get("case_id") or item.get("id") or "")
            return User(
                id=f"refugee::{case_id}",
                username=username,
                role=Role.REFUGEE,
                permissions=[Permission.READ_ONLY_SELF_SERVICE],
                display_name=name,
                case_id=case_id,
            )
    return None


def authenticate_user(role: Role, username: str, password: str) -> User | None:
    if role == Role.AUTHORITY:
        account = AUTHORITY_ACCOUNTS.get(username)
        if account and account["password"] == password:
            return account["user"]
        return None

    if role == Role.PARTNER:
        account = PARTNER_ACCOUNTS.get(username)
        if account and account["password"] == password:
            return account["user"]
        return None

    return authenticate_refugee(username, password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def user_from_claims(claims: dict | None) -> User | None:
    if not claims:
        return None

    role_value = claims.get("role")
    username = claims.get("username") or claims.get("sub")
    if not role_value or not username:
        return None

    try:
        role = Role(str(role_value))
    except ValueError:
        return None

    if role == Role.REFUGEE:
        return User(
            id=str(claims.get("uid") or f"refugee::{username}"),
            username=str(username),
            role=Role.REFUGEE,
            permissions=[Permission.READ_ONLY_SELF_SERVICE],
            display_name=claims.get("display_name"),
            case_id=claims.get("case_id"),
        )

    if role == Role.AUTHORITY:
        account = AUTHORITY_ACCOUNTS.get(str(username))
        return account["user"] if account else None

    if role == Role.PARTNER:
        account = PARTNER_ACCOUNTS.get(str(username))
        return account["user"] if account else None

    return get_demo_user(str(username))


def get_demo_user(username: str) -> User | None:
    return DEMO_USERS.get(username)
