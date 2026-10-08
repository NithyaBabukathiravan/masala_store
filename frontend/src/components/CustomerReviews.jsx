function CustomerReviews() {
  const reviews = [
    {
      id: 1,
      name: "Priya",
      location: "Chennai",
      rating: 5,
      review:
        "Magic Masala spices are really fresh and aromatic. The chilli powder gives amazing colour and taste to my dishes."
    },
    {
      id: 2,
      name: "Arun",
      location: "Coimbatore",
      rating: 5,
      review:
        "Very good quality spices. I especially loved the turmeric powder. The packaging was also neat and clean."
    },
    {
      id: 3,
      name: "Meena",
      location: "Madurai",
      rating: 5,
      review:
        "The spices have an authentic homemade taste. I will definitely order again for my family."
    }
  ];

  return (
    <section className="customer-reviews">

      <div className="reviews-heading">

        <p>WHAT OUR CUSTOMERS SAY</p>

        <h2>
          Loved by Spice Lovers ❤️
        </h2>

        <span>
          Fresh flavours and happy customers make us proud.
        </span>

      </div>


      <div className="reviews-grid">

        {reviews.map((customer) => (

          <div
            className="review-card"
            key={customer.id}
          >

            <div className="review-stars">
              {"⭐".repeat(customer.rating)}
            </div>

            <p className="review-text">
              "{customer.review}"
            </p>

            <div className="review-user">

              <div className="review-avatar">
                {customer.name.charAt(0)}
              </div>

              <div>
                <h3>
                  {customer.name}
                </h3>

                <span>
                  {customer.location}
                </span>
              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default CustomerReviews;