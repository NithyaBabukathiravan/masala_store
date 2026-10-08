function Hero() {
  return (
    <section className="hero-section">

      <div className="hero-content">
        <p className="hero-small-title">
          AUTHENTIC INDIAN SPICES
        </p>

        <h1>
          Bring the Taste of
          <span> Magic Masala </span>
          to Your Kitchen
        </h1>

        <p className="hero-description">
          Fresh, aromatic and authentic spices made to bring
          delicious Indian flavours to every meal.
        </p>

        <div className="hero-buttons">
          <a href="/shop" className="hero-shop-btn">
            Shop Now
          </a>

          <a href="/about" className="hero-about-btn">
            Discover More
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="/images/masala-world-logo.png"
          alt="Magic Masala"
        />
      </div>

    </section>
  );
}

export default Hero;