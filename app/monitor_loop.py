import asyncio
from datetime import datetime

from .database import SessionLocal
from .models import Service, MonitoringResult, Incident, Alert
from .monitor import check_service


async def monitoring_loop():
    while True:
        db = SessionLocal()

        try:
            services = db.query(Service).all()

            for service in services:
                result = check_service(service.url)

                # Save every monitoring check
                monitoring_result = MonitoringResult(
                    service_id=service.id,
                    status=result["status"],
                    status_code=result["status_code"],
                    response_time=result["response_time"],
                    failure_reason=result["failure_reason"]
                )

                db.add(monitoring_result)

                # Find an existing open incident
                open_incident = (
                    db.query(Incident)
                    .filter(
                        Incident.service_id == service.id,
                        Incident.status == "OPEN"
                    )
                    .first()
                )

                # Service is DOWN
                if result["status"] == "DOWN":

                    # Create an incident only if one isn't already open
                    if open_incident is None:
                        incident = Incident(
                            service_id=service.id,
                            status="OPEN"
                        )

                        db.add(incident)
                        
                        alert = Alert(
                            service_id=service.id,
                            type="DOWN",
                            message=f"{service.name} is DOWN"
                                     )

                        db.add(alert)

                # Service is UP
                elif result["status"] == "UP":

                    # Resolve the existing incident
                    if open_incident is not None:
                        

                        open_incident.status = "RESOLVED"
                        open_incident.resolved_at = datetime.utcnow()
                        
                        
                        alert = Alert(
                                      service_id=service.id,
                                      type="RECOVERED",
                                      message=f"{service.name} has recovered"
                                     )

                        db.add(alert)

            db.commit()

        finally:
            db.close()

        await asyncio.sleep(30)