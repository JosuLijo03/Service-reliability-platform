function Header({ onClearData }) {
  return (
    <header>
      <div className="header-content">
        <div>
          <h1>⚡ RELIABILITY HUB</h1>
          <p>Service Reliability & Incident Monitoring</p>
        </div>

        <button
          id="clear-data-button"
          className="clear-data-button"
          title="Clear all monitoring data"
          onClick={onClearData}
        >
          🗑️
        </button>
      </div>
    </header>
  );
}

export default Header;