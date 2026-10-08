import Header from "../components/Header";
import MagicHero from "../components/MagicHero";

function Home() {
  return (
    <>
      <Header />

      <main>
        <MagicHero />

        {/* Future sections */}

        <section id="products">
          <h2>Our Products</h2>
        </section>

        <section id="recipes">
          <h2>Our Recipes</h2>
        </section>
      </main>
    </>
  );
}

export default Home;