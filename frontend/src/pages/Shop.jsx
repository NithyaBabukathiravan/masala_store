import products from "../data/products";
import ProductGrid from "../components/ProductGrid";

function Shop() {
  const params = new URLSearchParams(window.location.search);

  const searchQuery = (params.get("search") || "").trim().toLowerCase();
  const categoryQuery = (params.get("category") || "").toLowerCase();

  const categoryNames = {
    biriyani: "Biriyani Masala",
    chicken: "Chicken Masala",
    mutton: "Mutton Masala",
    sambar: "Sambar Masala",
    rasam: "Rasam Masala",
    chilli: "Chilli Powder",
    turmeric: "Turmeric Powder",
    powdered: "Powdered Spices",
    whole: "Whole Spices",
    blended: "Blended Masalas",
  };

  const filteredProducts = products.filter((product) => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const description = product.description.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      name.includes(searchQuery) ||
      category.includes(searchQuery) ||
      description.includes(searchQuery);

    let matchesCategory = true;

    if (categoryQuery === "powdered") {
      matchesCategory = category.includes("powder");
    } else if (categoryQuery === "whole") {
      matchesCategory = category.includes("whole");
    } else if (categoryQuery === "blended") {
      matchesCategory = category.includes("blended");
    } else if (categoryQuery) {
      matchesCategory = category.includes(categoryQuery);
    }

    return matchesSearch && matchesCategory;
  });

  let pageTitle = "All Masalas";

  if (categoryQuery && categoryNames[categoryQuery]) {
    pageTitle = categoryNames[categoryQuery];
  } else if (searchQuery) {
    pageTitle = `Search Results: ${searchQuery}`;
  }

  return (
    <main>
      {filteredProducts.length > 0 ? (
        <ProductGrid
          title={pageTitle}
          products={filteredProducts}
        />
      ) : (
        <section className="product-section">
          <div className="section-heading">
            <h2>{pageTitle}</h2>
          </div>

          <p>No products found.</p>

          <a href="/shop" className="shop-now-button">
            View All Products
          </a>
        </section>
      )}
    </main>
  );
}

export default Shop;