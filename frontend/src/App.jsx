import "./App.css";

import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MagicHero from "./components/MagicHero";
import SpiceCategories from "./components/SpiceCategories";
import HomeOffer from "./components/HomeOffer";
import WhyChooseUs from "./components/WhyChooseUs";
import CustomerReviews from "./components/CustomerReviews";
import RecipeSection from "./components/RecipeSection";

import products from "./data/products";
import ProductGrid from "./components/ProductGrid";

import { CartProvider } from "./store/CartContext";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Recipes from "./pages/Recipes";
import BulkExport from "./pages/BulkExport";
import Contact from "./pages/Contact";

function App() {
  const currentPath = window.location.pathname;

  const isCartPage = currentPath === "/cart";
  const isCheckoutPage = currentPath === "/checkout";
  const isShopPage = currentPath === "/shop";
  const isAboutPage = currentPath === "/about";
  const isRecipesPage = currentPath === "/recipes";
  const isBulkExportPage = currentPath === "/bulk-export";
  const isContactPage = currentPath === "/contact";

  return (
    <CartProvider>
      <div>

        {/* =========================
            TOP ANNOUNCEMENT
        ========================= */}

        <AnnouncementBar />


        {/* =========================
            NAVBAR
        ========================= */}

        <Header />


        {/* =========================
            PAGE CONTENT
        ========================= */}

        {isCartPage ? (
          <Cart />

        ) : isCheckoutPage ? (
          <Checkout />

        ) : isShopPage ? (
          <Shop />

        ) : isAboutPage ? (
          <About />

        ) : isRecipesPage ? (
          <Recipes />

        ) : isBulkExportPage ? (
          <BulkExport />

        ) : isContactPage ? (
          <Contact />

        ) : (

          /* =========================
             HOME PAGE
          ========================= */

          <>

            {/* =========================
                MAGIC MASALA HERO
            ========================= */}

            <MagicHero />


            {/* =========================
                SPICE CATEGORIES
                Animated Images
            ========================= */}

            <SpiceCategories />


            {/* =========================
                BEST SELLING PRODUCTS
            ========================= */}

            <ProductGrid
              title="Our Best Selling Spices"
              products={products}
            />


            {/* =========================
                SPECIAL OFFER
            ========================= */}

            <HomeOffer />


            {/* =========================
                WHY CHOOSE MAGIC MASALA
            ========================= */}

            <WhyChooseUs />


            {/* =========================
                CUSTOMER REVIEWS
            ========================= */}

            <CustomerReviews />


            {/* =========================
                RECIPE INSPIRATION
            ========================= */}

            <RecipeSection />

          </>

        )}


        {/* =========================
            FOOTER
        ========================= */}

        <Footer />

      </div>
    </CartProvider>
  );
}

export default App;