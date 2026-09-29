from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime

from .database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    check_interval = Column(Integer, default=30)


class MonitoringResult(Base):
    __tablename__ = "monitoring_results"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        Integer,
        ForeignKey("services.id"),
        nullable=False
    )

    status = Column(String, nullable=False)
    status_code = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=True)
    failure_reason = Column(String, nullable=True)

    checked_at = Column(DateTime, default=datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        Integer,
        ForeignKey("services.id"),
        nullable=False
    )

    started_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

    status = Column(
        String,
        default="OPEN"
    )

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        Integer,
        ForeignKey("services.id"),
        nullable=False
    )

    type = Column(String, nullable=False)

    message = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )