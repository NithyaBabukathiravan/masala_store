import { useEffect, useState } from "react";

function MagicHero() {
  const images = [
    "/images/h1.jpeg",
    "/images/h2.jpeg",
    "/images/h3.jpeg",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [animation, setAnimation] = useState("slide-in");

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimation("zoom-out");

      setTimeout(() => {
        setCurrentImage((previous) => {
          return (previous + 1) % images.length;
        });

        setAnimation("slide-in");
      }, 700);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="magic-image-hero">

      {/* LEFT SIDE - SHOP NAME */}
      <div className="magic-image-text">

        <p className="magic-small-title">
          AUTHENTIC INDIAN SPICES
        </p>

        <h1>Magic Masala</h1>

        <h2>
          Taste the Magic
          <br />
          in Every Dish
        </h2>

        <p className="magic-description">
          Premium quality spices with rich aroma,
          authentic taste and traditional goodness.
        </p>

        <a href="/shop" className="magic-shop-button">
          Shop Now
        </a>

      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="magic-image-container">

        <img
          key={currentImage}
          src={images[currentImage]}
          alt="Magic Masala Spice"
          className={`magic-hero-image ${animation}`}
        />

      </div>

    </section>
  );
}

export default MagicHero;