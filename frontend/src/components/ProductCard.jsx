
import { useCart } from "../store/CartContext";
import RatingStars from "./RatingStars";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  function handleAddToCart() {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  }

  return (
    <article className="product-card">
      {discount > 0 && (
        <span className="discount-badge">
          {discount}% OFF
        </span>
      )}

      <img
        className="product-image"
        src={product.image}
        alt={product.name}
      />

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <RatingStars rating={product.rating} />

        <div className="product-prices">
          <span className="current-price">
            ₹{product.price}
          </span>

          {discount > 0 && (
            <span className="original-price">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <button
          className="add-cart-button"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
