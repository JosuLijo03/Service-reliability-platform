import httpx

from app.monitor import check_service


def test_check_service_success(monkeypatch):

    class MockResponse:
        status_code = 200

    def mock_get(url, timeout):
        return MockResponse()

    monkeypatch.setattr(
        "app.monitor.httpx.get",
        mock_get
    )

    result = check_service("https://example.com")

    assert result["status"] == "UP"
    assert result["status_code"] == 200
    assert result["failure_reason"] is None


def test_check_service_failure(monkeypatch):

    class MockResponse:
        status_code = 500

    def mock_get(url, timeout):
        return MockResponse()

    monkeypatch.setattr(
        "app.monitor.httpx.get",
        mock_get
    )

    result = check_service("https://example.com")

    assert result["status"] == "DOWN"
    assert result["status_code"] == 500
    assert result["failure_reason"] == "HTTP 500"
    
def test_check_service_timeout(monkeypatch):

    def mock_get(url, timeout):
        raise httpx.TimeoutException("Request timed out")

    monkeypatch.setattr(
        "app.monitor.httpx.get",
        mock_get
    )

    result = check_service("https://example.com")

    assert result["status"] == "DOWN"
    assert result["status_code"] is None
    assert result["failure_reason"] == "Request timed out"