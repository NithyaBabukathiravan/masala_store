import { useCart } from "../store/CartContext";

function Cart() {
  const {
    cartItems,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  return (
    <div className="cart-page">
      <h1>My Shopping Cart 🛒</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty!</h2>
          <a href="/">Continue Shopping</a>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  width="120"
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>

                  <p>Price: ₹{item.price}</p>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                  </div>

                  <p>
                    Subtotal: ₹{item.price * item.quantity}
                  </p>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ₹{cartTotal}</h2>

            <a href="/checkout" className="checkout-button">
              Proceed to Checkout →
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;