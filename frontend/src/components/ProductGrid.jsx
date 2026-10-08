
import ProductCard from "./ProductCard";

function ProductGrid({ title, products }) {
  return (
    <section className="product-section">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

export default ProductGrid;
