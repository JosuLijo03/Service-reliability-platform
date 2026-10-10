
import asyncio
import time
from datetime import datetime

from .database import SessionLocal
from .models import Service, MonitoringResult, Incident, Alert
from .monitor import check_service


async def monitoring_loop():
    next_check_times = {}
    configured_intervals = {}

    while True:
        db = SessionLocal()

        try:
            services = db.query(Service).all()
            current_service_ids = {service.id for service in services}

            # Remove scheduling information for deleted services.
            for service_id in list(next_check_times):
                if service_id not in current_service_ids:
                    next_check_times.pop(service_id, None)
                    configured_intervals.pop(service_id, None)

            now = time.monotonic()
            due_services = []

            for service in services:
                interval = max(1, int(service.check_interval or 30))

                # New services are checked immediately.
                # Interval changes are picked up from the database.
                if (
                    service.id not in next_check_times
                    or configured_intervals.get(service.id) != interval
                ):
                    configured_intervals[service.id] = interval
                    next_check_times[service.id] = now

                if now >= next_check_times[service.id]:
                    due_services.append(
                        (service.id, service.name, service.url, interval)
                    )

                    # Schedule the next check using this service's interval.
                    next_check_times[service.id] = now + interval

            # Perform due network checks without blocking the event loop.
            results = await asyncio.gather(
                *(
                    asyncio.to_thread(check_service, url)
                    for _, _, url, _ in due_services
                )
            )

            for (service_id, service_name, url, interval), result in zip(
                due_services, results
            ):
                monitoring_result = MonitoringResult(
                    service_id=service_id,
                    status=result["status"],
                    status_code=result["status_code"],
                    response_time=result["response_time"],
                    failure_reason=result["failure_reason"],
                )
                db.add(monitoring_result)

                open_incident = (
                    db.query(Incident)
                    .filter(
                        Incident.service_id == service_id,
                        Incident.status == "OPEN",
                    )
                    .first()
                )

                if result["status"] == "DOWN":
                    if open_incident is None:
                        db.add(
                            Incident(
                                service_id=service_id,
                                status="OPEN",
                            )
                        )
                        db.add(
                            Alert(
                                service_id=service_id,
                                type="DOWN",
                                message=f"{service_name} is DOWN",
                            )
                        )

                elif result["status"] == "UP":
                    if open_incident is not None:
                        open_incident.status = "RESOLVED"
                        open_incident.resolved_at = datetime.utcnow()

                        db.add(
                            Alert(
                                service_id=service_id,
                                type="RECOVERED",
                                message=f"{service_name} has recovered",
                            )
                        )

            db.commit()

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

        # Recheck the database frequently so interval edits are detected.
        await asyncio.sleep(1)
