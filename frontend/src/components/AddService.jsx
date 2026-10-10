import { useState } from "react";

function AddService({ onServiceAdded }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [checkInterval, setCheckInterval] = useState(30);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
          check_interval: Number(checkInterval),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to add service.");
      }

      setMessage(`Service "${result.name}" added successfully.`);
      setName("");
      setUrl("");
      
      if (onServiceAdded) {
        onServiceAdded();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>Add Service</h2>

      <form id="add-service-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="service-name">Service Name</label>
          <input
            type="text"
            id="service-name"
            placeholder="e.g. Google"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="service-url">Service URL</label>
          <input
            type="url"
            id="service-url"
            placeholder="https://example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="check-interval">
            Check Interval (seconds)
          </label>
          <input
            type="number"
            id="check-interval"
            value={checkInterval}
            min="5"
            onChange={(event) => setCheckInterval(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Service"}
        </button>
      </form>

      {message && <p id="add-service-message">{message}</p>}
    </section>
  );
}

export default AddService;