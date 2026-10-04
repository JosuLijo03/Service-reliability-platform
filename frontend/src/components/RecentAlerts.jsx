function RecentAlerts({ alerts }) {
  const recentAlerts = [...alerts]
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .slice(0, 6);

  return (
    <section className="panel">
      <h2>Recent Alerts</h2>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Service ID</th>
            <th>Message</th>
            <th>Created</th>
          </tr>
        </thead>

        <tbody>
          {recentAlerts.map((alert) => (
            <tr key={alert.id}>
              <td>
                <span
                  className={
                    alert.type === "DOWN"
                      ? "status-down"
                      : "status-resolved"
                  }
                >
                  {alert.type}
                </span>
              </td>

              <td>{alert.service_id}</td>

              <td>{alert.message}</td>

              <td>{formatDate(alert.created_at)}</td>
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

export default RecentAlerts;