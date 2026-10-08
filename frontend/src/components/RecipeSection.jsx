function RecipeSection() {
  const recipes = [
    {
      id: 1,
      image: "/images/chicken.png",
      name: "Spicy Chicken Curry",
      description: "A delicious and aromatic chicken curry.",
    },
    {
      id: 2,
      image: "/images/biriyani-masala.jpeg",
      name: "Traditional Masala Rice",
      description: "Flavourful rice made with authentic spices.",
    },
    {
      id: 3,
      image: "/images/sambar-masala.jpeg",
      name: "South Indian Sambar",
      description: "Bring traditional South Indian taste home.",
    },
  ];

  return (
    <section className="recipe-section">

      {/* HEADING */}
      <div className="recipe-heading">

        <p>COOK WITH MAGIC MASALA</p>

        <h2>
          Recipe Inspiration 🍛
        </h2>

        <span>
          Delicious recipes made better with our authentic spices.
        </span>

      </div>


      {/* RECIPE CARDS */}
      <div className="recipe-grid">

        {recipes.map((recipe) => (

          <div
            className="recipe-card"
            key={recipe.id}
          >

            {/* IMAGE */}
            <div className="recipe-image-container">

              <img
                src={recipe.image}
                alt={recipe.name}
                className="recipe-image"
              />

            </div>


            {/* CONTENT */}
            <div className="recipe-content">

              <h3>
                {recipe.name}
              </h3>

              <p>
                {recipe.description}
              </p>


              {/* VIEW RECIPE */}
              <a
                href={`/recipes?recipe=${recipe.id}`}
                className="recipe-button"
              >
                View Recipe →
              </a>

            </div>

          </div>

        ))}

      </div>


      {/* VIEW ALL */}
      <div className="recipe-all-button">

        <a href="/recipes">
          View All Recipes →
        </a>

      </div>

    </section>
  );
}

export default RecipeSection;