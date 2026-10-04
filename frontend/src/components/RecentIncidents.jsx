function RecentIncidents({ incidents }) {
  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.started_at) - new Date(a.started_at)
    )
    .slice(0, 4);

  return (
    <section className="panel">
      <h2>Recent Incidents</h2>

      <table>
        <thead>
          <tr>
            <th>Service ID</th>
            <th>Status</th>
            <th>Started</th>
            <th>Resolved</th>
            <th>Duration</th>
          </tr>
        </thead>

        <tbody>
          {recentIncidents.map((incident) => (
            <tr key={incident.id}>
              <td>{incident.service_id}</td>

              <td>
                <span
                  className={
                    incident.status === "OPEN"
                      ? "status-open"
                      : "status-resolved"
                  }
                >
                  {incident.status}
                </span>
              </td>

              <td>{formatDate(incident.started_at)}</td>

              <td>
                {incident.resolved_at
                  ? formatDate(incident.resolved_at)
                  : "--"}
              </td>

              <td>
                {formatDuration(
                  incident.started_at,
                  incident.resolved_at
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "--";
  }

  return new Date(`${timestamp}Z`).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
}

function formatDuration(startedAt, resolvedAt) {
  const start = new Date(`${startedAt}Z`);
  const end = resolvedAt
    ? new Date(`${resolvedAt}Z`)
    : new Date();

  const durationSeconds = Math.round(
    (end - start) / 1000
  );

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

export default RecentIncidents;