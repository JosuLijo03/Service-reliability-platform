// ================================
// Load dashboard data
// ================================

// ================================
// Load dashboard data
// ================================

async function loadDashboard() {
  try {
    const servicesResponse = await fetch("/services");
    const services = await servicesResponse.json();

    const incidentsResponse = await fetch("/incidents");
    const incidents = await incidentsResponse.json();

    const alertsResponse = await fetch("/alerts");
    const alerts = await alertsResponse.json();

    updateSummary(services, incidents);
    await updateServices(services);
    updateIncidents(incidents);
    updateAlerts(alerts);

  } catch (error) {
    console.error("Failed to load dashboard:", error);
  }
}


// ================================
// Update summary cards
// ================================

function updateSummary(services, incidents) {

  const totalServices = services.length;

  const openIncidents = incidents.filter(
    incident => incident.status === "OPEN"
  ).length;

  document.getElementById("total-services").textContent =
    totalServices;

  document.getElementById("open-incidents").textContent =
    openIncidents;
}


// ================================
// Update service table
// ================================

async function updateServices(services) {

  const table = document.getElementById("services-table");

  table.innerHTML = "";

  let servicesUp = 0;
  let servicesDown = 0;

  for (const service of services) {

    try {

      const response = await fetch(
        `/services/${service.id}/status`
      );

      const result = await response.json();

      const row = document.createElement("tr");

      let statusClass;
      let statusText;

      if (result.status === "UP") {

        statusClass = "status-up";
        statusText = "● UP";
        servicesUp++;

      } else {

        statusClass = "status-down";
        statusText = "● DOWN";
        servicesDown++;
      }

      row.innerHTML = `
                <td>${service.name}</td>

                <td>${service.url}</td>

                <td class="${statusClass}">
                    ${statusText}
                </td>

                <td>
                    ${result.response_time} ms
                </td>
            `;

      table.appendChild(row);

    } catch (error) {

      servicesDown++;

      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${service.name}</td>

                <td>${service.url}</td>

                <td class="status-down">
                    ● DOWN
                </td>

                <td>--</td>
            `;

      table.appendChild(row);
    }
  }

  document.getElementById("services-up").textContent =
    servicesUp;

  document.getElementById("services-down").textContent =
    servicesDown;
}


// ================================
// Update incident table
// ================================

function updateIncidents(incidents) {

  const table = document.getElementById("incidents-table");

  table.innerHTML = "";

  for (const incident of incidents) {

    const row = document.createElement("tr");

    const started =
      new Date(incident.started_at).toLocaleString();

    const resolved =
      incident.resolved_at
        ? new Date(incident.resolved_at).toLocaleString()
        : "--";

    let duration = "--";

    if (incident.duration_seconds !== null) {

      const seconds =
        Math.round(incident.duration_seconds);

      const minutes =
        Math.floor(seconds / 60);

      const remainingSeconds =
        seconds % 60;

      duration =
        `${minutes}m ${remainingSeconds}s`;
    }

    const statusClass =
      incident.status === "OPEN"
        ? "status-open"
        : "status-resolved";

    row.innerHTML = `
            <td>${incident.service_id}</td>

            <td class="${statusClass}">
                ${incident.status}
            </td>

            <td>${started}</td>

            <td>${resolved}</td>

            <td>${duration}</td>
        `;

    table.appendChild(row);
  }
}


// ================================
// Update alert table
// ================================

function updateAlerts(alerts) {

  const table = document.getElementById("alerts-table");

  table.innerHTML = "";

  for (const alert of alerts) {

    const row = document.createElement("tr");

    const created =
      new Date(alert.created_at).toLocaleString();

    const typeClass =
      alert.type === "DOWN"
        ? "status-down"
        : "status-resolved";

    row.innerHTML = `
            <td class="${typeClass}">
                ${alert.type}
            </td>
            <td>${alert.service_id}</td>
            <td>${alert.message}</td>
            <td>${created}</td>
        `;

    table.appendChild(row);
  }
}


// ================================
// Start dashboard
// ================================

loadDashboard();
setInterval(loadDashboard, 30000);