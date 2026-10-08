import { useState } from "react";

function Recipes() {
  const recipes = [
    {
      id: 1,
      name: "Spicy Chicken Curry",
      image: "/images/chicken.png",
      time: "40 Minutes",
      servings: "4 People",

      steps: [
        "Clean the chicken and keep it ready.",
        "Heat oil, fry onions and add ginger garlic paste.",
        "Add tomatoes, turmeric, chilli powder and coriander powder. Cook well.",
        "Add chicken, mix well and cook until almost done.",
        "Add 2 tbsp Magic Chicken Masala, a little water and cook until tender. Garnish with coriander and serve hot.",
      ],
    },

    {
      id: 2,
      name: "Traditional Masala Rice",
      image: "/images/biriyani-masala.jpeg",
      time: "35 Minutes",
      servings: "4 People",

      steps: [
        "Wash the rice and keep it ready.",
        "Heat oil, fry onions and add ginger garlic paste.",
        "Add tomatoes and vegetables and cook well.",
        "Add 2 tbsp Magic Biriyani Masala and mix well.",
        "Add rice, water and salt. Cook until soft and garnish with coriander.",
      ],
    },

    {
      id: 3,
      name: "South Indian Sambar",
      image: "/images/sambar-masala.jpeg",
      time: "30 Minutes",
      servings: "4 People",

      steps: [
        "Cook the toor dal and vegetables until soft.",
        "Add onion, tomato and tamarind water and boil well.",
        "Add 2 tbsp Magic Sambar Masala and mix well.",
        "Add cooked dal and salt and boil for a few minutes.",
        "Garnish with fresh coriander and serve hot with rice, idli or dosa.",
      ],
    },
  ];

  // URL-la irukkura recipe id-ah edukkum
  const params = new URLSearchParams(window.location.search);

  const recipeId = Number(params.get("recipe")) || 1;

  // Selected recipe
  const selectedRecipe =
    recipes.find((recipe) => recipe.id === recipeId) || recipes[0];

  const [recipe, setRecipe] = useState(selectedRecipe);

  return (
    <section className="recipes-page">

      {/* PAGE HEADING */}

      <div className="recipes-page-heading">

        <p>COOK WITH MAGIC MASALA</p>

        <h1>
          Delicious Recipe Ideas 🍛
        </h1>

        <span>
          Easy recipes made with our authentic Magic Masala spices.
        </span>

      </div>


      {/* RECIPE BUTTONS */}

      <div className="recipe-select-buttons">

        {recipes.map((item) => (

          <button
            key={item.id}
            onClick={() => setRecipe(item)}
            className={
              recipe.id === item.id
                ? "recipe-select active"
                : "recipe-select"
            }
          >
            {item.name}
          </button>

        ))}

      </div>


      {/* RECIPE DETAILS */}

      <div className="recipe-detail">

        {/* LEFT IMAGE */}

        <div className="recipe-detail-image">

          <img
            src={recipe.image}
            alt={recipe.name}
          />

        </div>


        {/* RIGHT CONTENT */}

        <div className="recipe-detail-content">

          <h2>
            {recipe.name}
          </h2>


          {/* TIME + SERVINGS */}

          <div className="recipe-info">

            <span>
              ⏱️ {recipe.time}
            </span>

            <span>
              👨‍👩‍👧‍👦 {recipe.servings}
            </span>

          </div>


          {/* COOKING STEPS */}

          <h3>
            How To Make
          </h3>

          <div className="recipe-steps">

            {recipe.steps.map(
              (step, index) => (

                <div
                  className="recipe-step"
                  key={index}
                >

                  <span className="step-number">
                    {index + 1}
                  </span>

                  <p>
                    {step}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </section>
  );
}

export default Recipes;