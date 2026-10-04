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
// Add service
// ================================

const addServiceForm =
  document.getElementById("add-service-form");

if (addServiceForm) {

  addServiceForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name =
      document.getElementById("service-name").value.trim();

    const url =
      document.getElementById("service-url").value.trim();

    const checkInterval =
      Number(
        document.getElementById("check-interval").value
      );

    const message =
      document.getElementById("add-service-message");

    try {

      const response = await fetch("/services", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: name,
          url: url,
          check_interval: checkInterval
        })
      });

      const result = await response.json();

      if (!response.ok) {

        message.textContent =
          result.detail || "Failed to add service.";

        return;
      }

      message.textContent =
        `Service "${result.name}" added successfully.`;

      addServiceForm.reset();

      document.getElementById("check-interval").value = 30;

      await loadDashboard();

    } catch (error) {

      console.error("Failed to add service:", error);

      message.textContent =
        "Failed to connect to the server.";
    }

  });
}


// ================================
// Clear data warning modal
// ================================

const clearDataButton =
  document.getElementById("clear-data-button");

const warningModal =
  document.getElementById("warning-modal");

const warningCancel =
  document.getElementById("warning-cancel");

const warningConfirm =
  document.getElementById("warning-confirm");


// Open warning modal

if (clearDataButton) {

  clearDataButton.addEventListener(
    "click",
    function () {

      warningModal.classList.add("show");

    }
  );
}


// Cancel

if (warningCancel) {

  warningCancel.addEventListener(
    "click",
    function () {

      warningModal.classList.remove("show");

    }
  );
}


// Confirm clear

if (warningConfirm) {

  warningConfirm.addEventListener(
    "click",
    async function () {

      try {

        warningConfirm.disabled = true;

        warningConfirm.textContent =
          "Clearing...";

        const response =
          await fetch("/data", {
            method: "DELETE"
          });

        const result =
          await response.json();

        if (!response.ok) {

          alert(
            result.detail ||
            "Failed to clear monitoring data."
          );

          return;
        }

        warningModal.classList.remove("show");

        await loadDashboard();

        const message =
          document.getElementById(
            "add-service-message"
          );

        if (message) {
          message.textContent =
            "All monitoring data has been cleared.";
        }

      } catch (error) {

        console.error(
          "Failed to clear monitoring data:",
          error
        );

        alert(
          "Failed to connect to the server."
        );

      } finally {

        warningConfirm.disabled = false;

        warningConfirm.textContent =
          "Clear All Data";
      }

    }
  );
}


// Close modal when clicking outside the box

if (warningModal) {

  warningModal.addEventListener(
    "click",
    function (event) {

      if (event.target === warningModal) {

        warningModal.classList.remove("show");

      }

    }
  );
}


// Close modal with Escape key

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      warningModal &&
      warningModal.classList.contains("show")
    ) {

      warningModal.classList.remove("show");

    }

  }
);


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

  const table =
    document.getElementById("services-table");

  table.innerHTML = "";

  // Show only the 6 most recently added services

  const recentServices =
    [...services]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6);

  let servicesUp = 0;
  let servicesDown = 0;

  for (const service of recentServices) {

    try {

      const response = await fetch(
        `/services/${service.id}/status`
      );

      const result = await response.json();

      const row =
        document.createElement("tr");

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
          ${result.response_time ?? "--"} ms
        </td>
      `;

      table.appendChild(row);

    } catch (error) {

      servicesDown++;

      const row =
        document.createElement("tr");

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

  const table =
    document.getElementById("incidents-table");

  table.innerHTML = "";

  // Show only the 4 most recent incidents

  const recentIncidents =
    [...incidents]
      .sort(
        (a, b) =>
          new Date(b.started_at) -
          new Date(a.started_at)
      )
      .slice(0, 4);

  for (const incident of recentIncidents) {

    const row =
      document.createElement("tr");

    const started =
      new Date(
        incident.started_at
      ).toLocaleString();

    const resolved =
      incident.resolved_at
        ? new Date(
            incident.resolved_at
          ).toLocaleString()
        : "--";

    let duration = "--";

    if (
      incident.duration_seconds !== null
    ) {

      const seconds =
        Math.round(
          incident.duration_seconds
        );

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

  const table =
    document.getElementById("alerts-table");

  table.innerHTML = "";

  // Show only the 6 most recent alerts

  const recentAlerts =
    [...alerts]
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 6);

  for (const alert of recentAlerts) {

    const row =
      document.createElement("tr");

    const created =
      new Date(
        alert.created_at
      ).toLocaleString();

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

setInterval(
  loadDashboard,
  30000
);