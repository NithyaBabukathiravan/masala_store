import { useState } from "react";
import { useCart } from "../store/CartContext";

function Header() {
  const [search, setSearch] = useState("");
  const { cartCount } = useCart();

  function handleSearch(event) {
    event.preventDefault();

    if (search.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(
        search.trim()
      )}`;
    }
  }

  return (
    <header className="main-navbar">

      {/* Brand Logo */}
      <a href="/" className="main-logo">
        <img
          src="/images/masala-world-logo.png"
          alt="Magic Masala Logo"
          className="brand-logo-image"
        />
      </a>

      {/* Navigation Links */}
      <nav className="main-nav-links">
        <a href="/">Home</a>
        <a href="/shop">Products</a>
        <a href="/recipes">Recipes</a>
        <a href="/about">About Us</a>
        <a href="/bulk-export">Bulk / Export</a>
        <a href="/contact">Contact Us</a>
      </nav>

      {/* Search and Cart */}
      <div className="main-nav-actions">

        {/* Search */}
        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search spices..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        {/* Cart */}
        <a href="/cart" className="nav-cart">
          🛒 Cart ({cartCount})
        </a>

      </div>
    </header>
  );
}

export default Header;