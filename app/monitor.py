import time
import httpx


def check_service(url: str):
    start_time = time.perf_counter()

    try:
        response = httpx.get(url, timeout=5.0)

        response_time = (time.perf_counter() - start_time) * 1000

        if 200 <= response.status_code < 400:
            status = "UP"
            failure_reason = None
        else:
            status = "DOWN"
            failure_reason = f"HTTP {response.status_code}"

        return {
            "status": status,
            "status_code": response.status_code,
            "response_time": round(response_time, 2),
            "failure_reason": failure_reason,
        }

    except httpx.TimeoutException:
        response_time = (time.perf_counter() - start_time) * 1000

        return {
            "status": "DOWN",
            "status_code": None,
            "response_time": round(response_time, 2),
            "failure_reason": "Request timed out",
        }

    except httpx.RequestError:
        response_time = (time.perf_counter() - start_time) * 1000

        return {
            "status": "DOWN",
            "status_code": None,
            "response_time": round(response_time, 2),
            "failure_reason": "Connection/request error",
        }

        from app.main import create_service


from app.schemas import ServiceCreate
from app.database import SessionLocal


def test_create_service():
    db = SessionLocal()

    try:
        service_data = ServiceCreate(
            name="Test Service", url="https://example.com", check_interval=30
        )

        service = create_service(service_data, db)

        assert service.name == "Test Service"
        assert service.url == "https://example.com"
        assert service.check_interval == 30

    finally:
        db.delete(service)
        db.commit()
        db.close()
