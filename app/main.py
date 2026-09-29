import asyncio

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from .models import Service, MonitoringResult, Incident , Alert
from .schemas import ServiceCreate, ServiceResponse
from .monitor import check_service
from .monitor_loop import monitoring_loop

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Service Reliability Platform",
    description="API and service monitoring platform",
    version="1.0.0",
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(monitoring_loop())


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return FileResponse("app/static/index.html")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/services", response_model=ServiceResponse)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    new_service = Service(
        name=service.name, url=service.url, check_interval=service.check_interval
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service


@app.get("/services", response_model=list[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).all()


@app.get("/check/{service_id}")
def check(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()

    if service is None:
        return {"error": "Service not found"}

    result = check_service(service.url)

    monitoring_result = MonitoringResult(
        service_id=service.id,
        status=result["status"],
        status_code=result["status_code"],
        response_time=result["response_time"],
        failure_reason=result["failure_reason"]
    )

    db.add(monitoring_result)
    db.commit()
    db.refresh(monitoring_result)

    return {
        "service_id": service.id,
        "service_name": service.name,
        "status": result["status"],
        "status_code": result["status_code"],
        "response_time": result["response_time"],
        "failure_reason": result["failure_reason"],
    }


@app.get("/services/{service_id}/history")
def get_service_history(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()

    if service is None:
        return {"error": "Service not found"}

    results = (
        db.query(MonitoringResult)
        .filter(MonitoringResult.service_id == service_id)
        .order_by(MonitoringResult.checked_at.desc())
        .all()
    )

    return {
        "service_id": service.id,
        "service_name": service.name,
        "history": [
            {
                "status": result.status,
                "status_code": result.status_code,
                "response_time": result.response_time,
                "failure_reason": result.failure_reason,
                "checked_at": result.checked_at,
                
            }
            for result in results
        ]
    }


@app.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()

    return [
        {
            "id": incident.id,
            "service_id": incident.service_id,
            "status": incident.status,
            "started_at": incident.started_at,
            "resolved_at": incident.resolved_at,
            "duration_seconds": (
                (incident.resolved_at - incident.started_at).total_seconds()
                if incident.resolved_at
                else None
            ),
        }
        for incident in incidents
    ]


@app.put("/services/{service_id}")
def update_service(
    service_id: int, service: ServiceCreate, db: Session = Depends(get_db)
):
    existing_service = db.query(Service).filter(Service.id == service_id).first()

    if existing_service is None:
        return {"error": "Service not found"}

    existing_service.name = service.name
    existing_service.url = service.url
    existing_service.check_interval = service.check_interval

    db.commit()
    db.refresh(existing_service)

    return existing_service


@app.get("/services/{service_id}/uptime")
def get_service_uptime(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()

    if service is None:
        return {"error": "Service not found"}

    results = (
        db.query(MonitoringResult)
        .filter(MonitoringResult.service_id == service_id)
        .all()
    )

    total_checks = len(results)
    successful_checks = sum(1 for result in results if result.status == "UP")

    if total_checks == 0:
        uptime = 0
    else:
        uptime = (successful_checks / total_checks) * 100

    return {
        "service_id": service.id,
        "service_name": service.name,
        "total_checks": total_checks,
        "successful_checks": successful_checks,
        "uptime_percentage": round(uptime, 2),
    }


@app.get("/services/{service_id}/status")
def get_service_status(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()

    if service is None:
        return {"error": "Service not found"}

    latest_result = (
        db.query(MonitoringResult)
        .filter(MonitoringResult.service_id == service_id)
        .order_by(MonitoringResult.checked_at.desc())
        .first()
    )

    if latest_result is None:
        return {
            "service_id": service.id,
            "service_name": service.name,
            "status": "UNKNOWN",
            "response_time": None,
            "checked_at": None,
        }

    return {
        "service_id": service.id,
        "service_name": service.name,
        "status": latest_result.status,
        "status_code": latest_result.status_code,
        "response_time": latest_result.response_time,
        "checked_at": latest_result.checked_at,
        "failure_reason": latest_result.failure_reason,
    }
    
    
@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return [
        {
            "id": alert.id,
            "service_id": alert.service_id,
            "type": alert.type,
            "message": alert.message,
            "created_at": alert.created_at,
        }
        for alert in alerts
    ]
