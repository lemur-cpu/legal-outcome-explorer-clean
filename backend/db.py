import uuid
from datetime import datetime

from sqlalchemy import (
    ARRAY,
    Float,
    Integer,
    Text,
    Timestamp,
    create_engine,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from backend.config import settings


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

engine = create_engine(settings.database_url, pool_pre_ping=True)


# ---------------------------------------------------------------------------
# ORM base
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Tables
# ---------------------------------------------------------------------------

class Case(Base):
    __tablename__ = "cases"

    case_id: Mapped[str] = mapped_column(Text, primary_key=True)
    docket_number: Mapped[str | None] = mapped_column(Text)
    court: Mapped[str | None] = mapped_column(Text)
    year: Mapped[int | None] = mapped_column(Integer)
    outcome: Mapped[str | None] = mapped_column(Text)          # affirmed | reversed | remanded
    legal_domain: Mapped[str | None] = mapped_column(Text)     # comma-separated
    full_text: Mapped[str | None] = mapped_column(Text)
    token_count: Mapped[int | None] = mapped_column(Integer)
    label_confidence: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime | None] = mapped_column(
        Timestamp, default=datetime.utcnow
    )


class QueryLog(Base):
    __tablename__ = "query_logs"

    query_id: Mapped[str] = mapped_column(
        Text,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    query_text: Mapped[str | None] = mapped_column(Text)
    retrieved_ids: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    prediction: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Float)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime | None] = mapped_column(
        Timestamp, server_default=text("now()")
    )


# ---------------------------------------------------------------------------
# Init helper (called on API startup)
# ---------------------------------------------------------------------------

def create_tables() -> None:
    Base.metadata.create_all(engine)
