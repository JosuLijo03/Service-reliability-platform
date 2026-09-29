\# Service Reliability \& Incident Monitoring Platform



A lightweight service monitoring platform that continuously checks APIs and services for availability, response latency, failures, incidents, and recovery.



\## Overview



The platform monitors registered services and records their health over time.



When a service becomes unavailable, the system automatically:



\- Detects the failure

\- Records the monitoring result

\- Creates an incident

\- Generates a DOWN alert



When the service recovers, the system:



\- Detects the recovery

\- Resolves the open incident

\- Records the incident duration

\- Generates a RECOVERED alert



The project also provides a web dashboard for viewing service health, incidents, alerts, and reliability information.



\## Architecture



Browser

&#x20;  |

&#x20;  v

HTML / CSS / JavaScript Dashboard

&#x20;  |

&#x20;  v

FastAPI REST API

&#x20;  |

&#x20;  +--------------------+

&#x20;  |                    |

&#x20;  v                    v

Monitoring Engine     SQLite Database

&#x20;  |

&#x20;  v

HTTPX

&#x20;  |

&#x20;  v

External APIs / Services



\## Features



\- Service registration

\- Service health monitoring

\- HTTP availability checks

\- Response-time measurement

\- Failure detection

\- Incident creation and resolution

\- Recovery tracking

\- Alert generation

\- Monitoring history

\- Uptime calculation

\- REST API

\- Web dashboard

\- Automated tests

\- Docker deployment



\## Technology Stack



\### Backend

\- Python

\- FastAPI

\- SQLAlchemy

\- HTTPX



\### Frontend

\- HTML

\- CSS

\- JavaScript



\### Database

\- SQLite



\### Testing

\- pytest



\### Deployment

\- Docker



\## API Endpoints



| Method | Endpoint | Description |

|---|---|---|

| GET | `/health` | Check API health |

| POST | `/services` | Register a service |

| GET | `/services` | List registered services |

| PUT | `/services/{service\_id}` | Update a service |

| GET | `/check/{service\_id}` | Manually check a service |

| GET | `/services/{service\_id}/status` | Get current service status |

| GET | `/services/{service\_id}/history` | Get monitoring history |

| GET | `/services/{service\_id}/uptime` | Calculate service uptime |

| GET | `/incidents` | View incidents |

| GET | `/alerts` | View alerts |



Interactive API documentation is available through FastAPI Swagger UI at:



`http://localhost:8000/docs`



\## Running Locally



Create and activate a virtual environment:



```bash

python -m venv venv

venv\\Scripts\\activate

