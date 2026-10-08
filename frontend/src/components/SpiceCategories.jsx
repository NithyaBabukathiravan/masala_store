function SpiceCategories() {
  const spices = [
    {
      id: 1,
      name: "Powder Spices",
      description:
        "Pure spices for rich flavour and colour.",
      image: "/images/powder-spices.png",
      icon: "🌶️",
    },

    {
      id: 2,
      name: "Whole Spices",
      description:
        "Fresh aroma and authentic taste.",
      image: "/images/whole-spices.jpg",
      icon: "🌿",
    },

    {
      id: 3,
      name: "Blended Masalas",
      description:
        "Perfect spice blends for delicious dishes.",
      image: "/images/blended-masalas.png",
      icon: "🍛",
    },

    {
      id: 4,
      name: "South Indian Masalas",
      description:
        "Traditional flavours for everyday cooking.",
      image: "/images/south-indian-masalas.png",
      icon: "🥘",
    },

    {
      id: 5,
      name: "Special Masalas",
      description:
        "Special blends for tasty and memorable meals.",
      image: "/images/special-masalas.png",
      icon: "🍚",
    },
  ];

  return (
    <section className="spice-showcase">

      {/* =========================
          HEADING
      ========================= */}

      <div className="spice-showcase-heading">

        <p>
          EXPLORE OUR COLLECTION
        </p>

        <h2>
          Discover Our Spices 🌶️
        </h2>

        <span>
          Authentic spices for every delicious dish.
        </span>

      </div>


      {/* =========================
          5 IMAGES - ONE LINE
      ========================= */}

      <div className="spice-card-grid">

        {spices.map((spice) => (

          <div
            className="spice-card"
            key={spice.id}
          >

            {/* IMAGE */}

            <div className="spice-card-image">

              <img
                src={spice.image}
                alt={spice.name}
              />

              {/* ICON */}

              <div className="spice-card-icon">
                {spice.icon}
              </div>

            </div>


            {/* CONTENT */}

            <div className="spice-card-content">

              <h3>
                {spice.name}
              </h3>

              <p>
                {spice.description}
              </p>

              <a
                href="/shop"
                className="spice-shop-button"
              >
                Shop Now →
              </a>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default SpiceCategories;