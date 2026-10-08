import { useState } from "react";
import { useCart } from "../store/CartContext";

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const city = formData.city.trim();
    const pincode = formData.pincode.trim();

    if (!name || !phone || !address || !city || !pincode) {
      alert("Please fill in all delivery details.");
      return;
    }

    clearCart();

    alert(
      `Order placed successfully!\nThank you, ${name}!`
    );

    window.location.href = "/";
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <h1>Checkout</h1>

        <div className="empty-cart">
          <h2>Your cart is empty!</h2>
          <p>Add some spices before proceeding to checkout.</p>
          <a href="/shop">Continue Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit}>
        <h2>Delivery Details</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Mobile Number"
          value={formData.phone}
          onChange={handleChange}
          pattern="[0-9]{10}"
          title="Enter a valid 10-digit mobile number"
          maxLength={10}
          required
        />

        <textarea
          name="address"
          placeholder="Full Delivery Address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="pincode"
          placeholder="PIN Code"
          value={formData.pincode}
          onChange={handleChange}
          pattern="[0-9]{6}"
          title="Enter a valid 6-digit PIN code"
          maxLength={6}
          required
        />

        <div className="order-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <p key={item.id}>
              {item.name} × {item.quantity} — ₹
              {item.price * item.quantity}
            </p>
          ))}

          <h3>Total: ₹{cartTotal}</h3>
        </div>

        <button type="submit">
          Place Order
        </button>
      </form>
    </div>
  );
}

export default Checkout;