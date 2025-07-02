# app/db/base_class.py
from typing import Any
from sqlalchemy.ext.declarative import declared_attr, declarative_base

class CustomBase:
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    id: Any

Base = declarative_base(cls=CustomBase)