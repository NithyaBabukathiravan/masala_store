
function About() {
  return (
    <main className="about-page">
      {/* About Hero */}
      <section className="about-hero">
        <p className="hero-label">OUR STORY</p>

        <h1>About Masala World</h1>

        <p>
          Bringing authentic Indian flavours to every kitchen
          with quality spices and traditional masalas.
        </p>
      </section>

      {/* Our Story */}
      <section className="about-story">
        <div className="about-story-content">
          <h2>Our Story</h2>

          <p>
            At Masala World, we believe that every great meal
            begins with the right spices. Our goal is to make
            traditional Indian flavours a part of every home.
          </p>

          <p>
            From aromatic biriyani masala to everyday turmeric
            and chilli powder, we bring together the spices that
            make Indian cooking special.
          </p>
        </div>

        <div className="about-story-icon">
          <span className="about-chilli">🌶️</span>
          <p>Pure • Fresh • Authentic</p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-values">
        <h2>Why Choose Us?</h2>

        <div className="about-values-grid">
          <article className="about-value-card">
            <span>🌿</span>
            <h3>Quality Ingredients</h3>
            <p>
              We focus on quality ingredients for flavourful
              everyday cooking.
            </p>
          </article>

          <article className="about-value-card">
            <span>🥣</span>
            <h3>Authentic Taste</h3>
            <p>
              Traditional spice blends inspired by Indian
              cooking.
            </p>
          </article>

          <article className="about-value-card">
            <span>📦</span>
            <h3>Careful Packaging</h3>
            <p>
              Products presented with care to support storage
              and everyday use.
            </p>
          </article>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="about-quality">
        <h2>Our Quality Commitment</h2>

        <p>
          We aim to provide flavourful spices with clear product
          information and careful packaging. We want to bring
          the taste of traditional Indian cooking to your home.
        </p>

        <a href="/shop" className="shop-now-button">
          Explore Our Products →
        </a>
      </section>
    </main>
  );
}

export default About;

