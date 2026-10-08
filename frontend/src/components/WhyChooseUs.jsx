function WhyChooseUs() {
  const reasons = [
    {
      icon: "🌿",
      title: "100% Quality",
      description:
        "Carefully selected spices with premium quality and authentic taste.",
    },
    {
      icon: "🌶️",
      title: "Fresh Spices",
      description:
        "Freshly packed spices that bring rich aroma and flavour to your kitchen.",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description:
        "We make sure your favourite spices reach your doorstep safely and quickly.",
    },
    {
      icon: "❤️",
      title: "Customer Love",
      description:
        "Trusted by customers who love authentic taste and quality spices.",
    },
  ];

  return (
    <section className="why-choose-us">

      <div className="why-heading">

        <p>WHY CHOOSE US?</p>

        <h2>
          Why Choose Magic Masala?
        </h2>

        <span>
          Quality spices made with care for your everyday cooking.
        </span>

      </div>

      <div className="why-cards">

        {reasons.map((reason) => (
          <div className="why-card" key={reason.title}>

            <div className="why-icon">
              {reason.icon}
            </div>

            <h3>
              {reason.title}
            </h3>

            <p>
              {reason.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default WhyChooseUs;