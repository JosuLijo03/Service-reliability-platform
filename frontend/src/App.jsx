import "./App.css";
import { useCallback, useEffect, useState } from "react";

import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import AddService from "./components/AddService";
import ServiceHealth from "./components/ServiceHealth";
import RecentAlerts from "./components/RecentAlerts";
import RecentIncidents from "./components/RecentIncidents";
import ClearDataModal from "./components/ClearDataModal";

function App() {
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [serviceStatuses, setServiceStatuses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [servicesResponse, incidentsResponse, alertsResponse] =
        await Promise.all([
          fetch("/services"),
          fetch("/incidents"),
          fetch("/alerts"),
        ]);

      if (
        !servicesResponse.ok ||
        !incidentsResponse.ok ||
        !alertsResponse.ok
      ) {
        throw new Error("Failed to load dashboard data.");
      }

      const servicesData = await servicesResponse.json();
      const incidentsData = await incidentsResponse.json();
      const alertsData = await alertsResponse.json();

      setServices(servicesData);
      setIncidents(incidentsData);
      setAlerts(alertsData);

      const recentServices = [...servicesData]
        .sort((a, b) => b.id - a.id)
        .slice(0, 6);

      const statusResults = await Promise.all(
        recentServices.map(async (service) => {
          try {
            const response = await fetch(
              `/services/${service.id}/status`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch service status.");
            }

            const statusData = await response.json();

            return {
              ...service,
              status: statusData.status,
              response_time: statusData.response_time,
            };
          } catch {
            return {
              ...service,
              status: "DOWN",
              response_time: null,
            };
          }
        })
      );

      setServiceStatuses(statusResults);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleServiceAdded = () => {
    loadDashboard();
  };

  const handleClearData = async () => {
    setIsClearing(true);

    try {
      const response = await fetch("/data", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear monitoring data.");
      }

      setIsModalOpen(false);

      await loadDashboard();
    } catch (error) {
      console.error("Failed to clear data:", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsClearing(false);
    }
  };

  const servicesUp = serviceStatuses.filter(
    (service) => service.status === "UP"
  ).length;

  const servicesDown = serviceStatuses.filter(
    (service) => service.status !== "UP"
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status === "OPEN"
  ).length;

  return (
    <>
      <Header onClearData={() => setIsModalOpen(true)} />

      <main>
        <SummaryCards
          totalServices={services.length}
          servicesUp={servicesUp}
          servicesDown={servicesDown}
          openIncidents={openIncidents}
        />

        <AddService onServiceAdded={handleServiceAdded} />

        <ServiceHealth services={serviceStatuses} />

        <RecentAlerts alerts={alerts} />

        <RecentIncidents incidents={incidents} />
      </main>

      <ClearDataModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleClearData}
        isClearing={isClearing}
      />
    </>
  );
}

export default App;