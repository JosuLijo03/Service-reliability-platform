from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.main import create_service
from app.models import Service, MonitoringResult
from app.schemas import ServiceCreate


def test_create_service():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    try:
        service_data = ServiceCreate(
            name="Test Service",
            url="https://example.com",
            check_interval=30
        )

        service = create_service(service_data, db)

        assert service.id is not None
        assert service.name == "Test Service"
        assert service.url == "https://example.com"
        assert service.check_interval == 30

    finally:
        db.close()
        engine.dispose()


def test_monitoring_result_is_saved():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )

    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    try:
        service = Service(
            name="Test Service",
            url="https://example.com",
            check_interval=30
        )

        db.add(service)
        db.commit()
        db.refresh(service)

        result = MonitoringResult(
            service_id=service.id,
            status="UP",
            status_code=200,
            response_time=120.5,
            failure_reason=None
        )

        db.add(result)
        db.commit()
        db.refresh(result)

        saved_result = (
            db.query(MonitoringResult)
            .filter(MonitoringResult.service_id == service.id)
            .first()
        )

        assert saved_result is not None
        assert saved_result.status == "UP"
        assert saved_result.status_code == 200
        assert saved_result.response_time == 120.5
        assert saved_result.failure_reason is None

    finally:
        db.close()
        engine.dispose()