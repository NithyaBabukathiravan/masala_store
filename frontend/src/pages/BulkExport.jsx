import { useState } from "react";

function BulkExport() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    enquiryType: "Bulk Order",
    quantity: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="bulk-export-page">
      <section className="bulk-export-hero">
        <p className="hero-label">BUSINESS ENQUIRIES</p>
        <h1>Bulk Orders & Export</h1>

        <p>
          Looking for quality Indian masalas in bulk?
          Contact Masala World for wholesale and export enquiries.
        </p>
      </section>

      <section className="bulk-export-content">
        <div className="bulk-export-info">
          <h2>Partner With Us</h2>

          <p>
            We welcome bulk buyers, wholesalers, retailers,
            distributors, and export enquiries.
          </p>

          <div className="bulk-service-card">
            <h3>📦 Bulk Orders</h3>
            <p>Enquire about large-quantity spice orders.</p>
          </div>

          <div className="bulk-service-card">
            <h3>🏪 Wholesale Enquiry</h3>
            <p>Discuss wholesale purchasing requirements.</p>
          </div>

          <div className="bulk-service-card">
            <h3>🌍 Export Enquiry</h3>
            <p>Tell us about your international supply needs.</p>
          </div>
        </div>

        <div className="bulk-export-form-container">
          <h2>Send an Enquiry</h2>

          {submitted ? (
            <div className="enquiry-success">
              <h3>Thank you, {formData.name}!</h3>

              <p>
                Your enquiry form is complete. It has not been
                sent to a business yet because backend integration
                is not connected.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form
              className="bulk-export-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="enquiryType">
                Enquiry Type
              </label>

              <select
                id="enquiryType"
                name="enquiryType"
                value={formData.enquiryType}
                onChange={handleChange}
                required
              >
                <option value="Bulk Order">Bulk Order</option>
                <option value="Wholesale Enquiry">
                  Wholesale Enquiry
                </option>
                <option value="Export Enquiry">
                  Export Enquiry
                </option>
              </select>

              <label htmlFor="name">Your Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="company">Company Name</label>

              <input
                id="company"
                type="text"
                name="company"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleChange}
              />

              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <label htmlFor="quantity">
                Required Quantity
              </label>

              <input
                id="quantity"
                type="text"
                name="quantity"
                placeholder="Example: 100 kg"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <label htmlFor="message">
                Additional Details
              </label>

              <textarea
                id="message"
                name="message"
                placeholder="Tell us which masalas you need..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
              />

              <button type="submit">
                Submit Enquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default BulkExport;