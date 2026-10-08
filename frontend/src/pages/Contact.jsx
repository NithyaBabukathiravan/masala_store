import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
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

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setSubmitted(false);
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <p className="hero-label">WE ARE HERE TO HELP</p>
        <h1>Contact Us</h1>
        <p>
          Have a question about our masalas, products, or bulk orders?
          Send us a message.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-details">
          <h2>Get in Touch</h2>

          <div className="contact-info-card">
            <h3>📞 Phone</h3>
            <p>Add your business phone number</p>
          </div>

          <div className="contact-info-card">
            <h3>✉️ Email</h3>
            <p>Add your business email address</p>
          </div>

          <div className="contact-info-card">
            <h3>📍 Address</h3>
            <p>Add your company address</p>
          </div>

          <div className="contact-info-card">
            <h3>🌶️ Masala World</h3>
            <p>
              Authentic Indian spices for every kitchen.
            </p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>

          {submitted ? (
            <div className="contact-success">
              <h3>Thank you, {formData.name}!</h3>

              <p>
                Your message form has been completed. It has not
                been sent yet because backend integration is not
                connected.
              </p>

              <button type="button" onClick={resetForm}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="contact-name">Full Name</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label htmlFor="contact-phone">Phone Number</label>
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                placeholder="Enter the subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />

              <button type="submit">
                Submit Message
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default Contact;