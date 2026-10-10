# Testing & Validation Report

## Project

**Service Reliability & Incident Monitoring Platform**

This document records automated and manual checks performed during
development. It describes the observed results, not a claim of
production readiness.

## Environment

-   Operating system: Windows
-   Python: 3.12.1
-   Test runner: pytest 9.1.1
-   Backend: FastAPI
-   Database: SQLite (`monitoring.db`)
-   Frontend: React with Vite

## 1. Automated test results

Command used to run the complete test suite:

``` cmd
python -m pytest -v
```

**Observed result:** `5 passed, 3 warnings in 0.85s`

  Test area                                      Tests passed Result
  -------------------------------------------- -------------- --------
  API tests (`tests/test_api.py`)                           2 Passed
  Monitoring tests (`tests/test_monitor.py`)                3 Passed
  Total                                                     5 Passed

The monitoring tests covered: - Successful HTTP check - Failed HTTP
check - Request timeout

The API tests included verification that a monitoring result is saved.

## 2. Manual incident lifecycle test

The manual test used service ID `8`, named `Failure Test Service`.
Existing records were preserved throughout the test.

### A. Previous failure and recovery cycle

The database already contained: - Incident ID `2`: `RESOLVED` - Alert ID
`2`: `DOWN` - Alert ID `3`: `RECOVERED`

### B. Simulated failure

The service URL was temporarily changed to:

``` text
http://127.0.0.1:1
```

The monitoring loop detected the failure. The database showed: -
Incident ID `3`: `OPEN` - Alert ID `4`: `DOWN`

### C. Repeated-failure check

After allowing more monitoring cycles, the database counts were:

  Check                             Observed count
  ------------------------------- ----------------
  Open incidents for service 8                   1
  Total incidents for service 8                  2
  DOWN alerts for service 8                      2

The two DOWN alerts represented two separate failure cycles. No
additional open incident or DOWN alert appeared during the
repeated-failure observation window.

### D. Recovery check

The service URL was restored to:

``` text
https://example.com
```

After the monitoring loop detected recovery, the database showed: -
Incident ID `3` changed to `RESOLVED` - Alert ID `5` was created with
type `RECOVERED` - Open incidents for service 8: `0` - Recovery alerts
for service 8: `2`

The two recovery alerts corresponded to the two separate
failure/recovery cycles.

## 3. Deprecation warnings

The full test run passed but reported three warnings. The output
included:

1.  **FastAPI startup event deprecation:** the code uses `on_event`;
    FastAPI recommends lifespan event handlers.
2.  **Naive UTC datetime deprecation:** a database datetime default uses
    `datetime.utcnow()`, which Python 3.12 warns is deprecated in favor
    of timezone-aware UTC datetimes.

These warnings did not fail the test suite. Refactoring them is a
follow-up cleanup task.

## 4. What these tests demonstrate

Based on the tests and manual checks recorded above, the project has
demonstrated: - Basic API behavior and persistence of monitoring
results - HTTP success, failure, and timeout handling - Creation of an
incident and DOWN alert when a service fails - No duplicate open
incident or DOWN alert during the repeated-failure observation window -
Resolution of the open incident and creation of a recovery alert when
the service recovers

## 5. Limitations and follow-up work

These results are not a guarantee of production readiness. The automated
suite currently contains five tests, and the incident lifecycle checks
were performed manually against the local SQLite database.

Recommended follow-up work: - Add automated tests for repeated failures,
incident creation, and recovery transitions. - Add automated checks that
verify duplicate alerts are not created. - Replace deprecated FastAPI
startup events with a lifespan handler. - Replace naive UTC datetime
defaults with timezone-aware UTC datetimes. - Run a fresh-start test
following the README instructions. - Verify the React dashboard after
the final recovery check. - Add tests for unexpected monitoring-loop
exceptions and confirm that one failed check does not permanently stop
background monitoring.

## 6. Reproduction notes

The commands used for automated testing were:

``` cmd
python -m pytest -v tests\test_api.py
python -m pytest -v tests\test_monitor.py
python -m pytest -v
```

The manual incident test used SQLite read queries to inspect service ID
`8`, its incidents, and its alerts. The test changed only that service's
URL and did not delete the database or its history.

------------------------------------------------------------------------

**Last recorded result:** 5 automated tests passed; 0 failed; 3
warnings. Manual repeated-failure and recovery checks produced the
expected incident and alert counts.
