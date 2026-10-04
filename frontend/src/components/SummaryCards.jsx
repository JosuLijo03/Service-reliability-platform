function SummaryCards({
  totalServices,
  servicesUp,
  servicesDown,
  openIncidents,
}) {
  return (
    <section className="summary">
      <div className="card">
        <h3>Total Services</h3>
        <p>{totalServices}</p>
      </div>

      <div className="card">
        <h3>Services UP</h3>
        <p>{servicesUp}</p>
      </div>

      <div className="card">
        <h3>Services DOWN</h3>
        <p>{servicesDown}</p>
      </div>

      <div className="card">
        <h3>Open Incidents</h3>
        <p>{openIncidents}</p>
      </div>
    </section>
  );
}

export default SummaryCards;