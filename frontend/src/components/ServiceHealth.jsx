function ServiceHealth({ services }) {
  const recentServices = [...services]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  return (
    <section className="panel">
      <h2>Service Health</h2>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>URL</th>
            <th>Status</th>
            <th>Latency</th>
          </tr>
        </thead>

        <tbody>
          {recentServices.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ServiceRow({ service }) {
  return (
    <tr>
      <td>{service.name}</td>
      <td>{service.url}</td>
      <td>
        {service.status === "UP" ? (
          <span className="status-up">🟢 UP</span>
        ) : (
          <span className="status-down">🔴 DOWN</span>
        )}
      </td>
      <td>
        {service.response_time != null
          ? `${service.response_time} ms`
          : "--"}
      </td>
    </tr>
  );
}

export default ServiceHealth;