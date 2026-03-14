from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PersonBase(BaseModel):
    primary_name: str
    alt_names: list[str] = Field(default_factory=list)
    dob: Optional[date] = None
    sex: Optional[str] = None
    nationality: Optional[str] = None
    primary_language: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_fields(cls, value):
        if not isinstance(value, dict):
            return value

        payload = dict(value)
        if "name" in payload and "primary_name" not in payload:
            payload["primary_name"] = payload.pop("name")
        if "language" in payload and "primary_language" not in payload:
            payload["primary_language"] = payload.pop("language")
        if "date_of_birth" in payload and "dob" not in payload:
            payload["dob"] = payload.pop("date_of_birth")
        return payload

class PersonCreate(PersonBase):
    pass

class Person(PersonBase):
    id: str
    created_at: str
    created_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
