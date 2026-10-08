"""Demo data podum: python seed.py
(Frontend-la irundha 11 products, categories, recipes, coupons.) Safe to run again."""
from datetime import datetime, timedelta

from sqlalchemy import select

from app.database import Base, SessionLocal, engine, ensure_database
from app.main import ensure_admin
from app.models import Category, Coupon, Product, Recipe
from app.utils import slugify

CATEGORIES = {
    "Powdered Spices": ("Freshly ground everyday powders", "/images/powder-spices.png"),
    "Whole Spices": ("Pure whole spices, farm to kitchen", "/images/whole-spices.jpg"),
    "Blended Masalas": ("Ready-to-use signature blends", "/images/blended-masalas.png"),
    "South Indian Masalas": ("Sambar, rasam and more", "/images/south-indian-masalas.png"),
    "Special Masalas": ("Biriyani, chicken and mutton specials", "/images/special-masalas.png"),
}

# name, category, price, mrp, rating, image, description, spice, weight, stock
PRODUCTS = [
    ("Premium Turmeric Powder", "Powdered Spices", 80, 100, 4, "turmeric.png", "Fresh and aromatic turmeric powder.", "Mild", "200 g", 120),
    ("Red Chilli Powder", "Powdered Spices", 100, 120, 5, "chilli.png", "Spicy red chilli powder for everyday cooking.", "Spicy", "200 g", 100),
    ("Garam Masala", "Blended Masalas", 120, 150, 5, "garam-masala.png", "Aromatic spice blend for delicious meals.", "Medium", "100 g", 80),
    ("Whole Cumin Seeds", "Whole Spices", 60, 75, 4, "cumin.png", "Fragrant cumin seeds for traditional recipes.", "Mild", "100 g", 150),
    ("Coriander Powder", "Powdered Spices", 70, 90, 4, "coriander.png", "Finely ground coriander with a fresh aroma.", "Mild", "200 g", 110),
    ("Black Pepper-Powder", "Whole Spices", 90, 110, 3, "black-pepper.png", "Bold black pepper for extra flavour.", "Spicy", "100 g", 7),
    ("Special Biriyani Masala", "Special Masalas", 140, 170, 5, "biriyani-masala.png", "Aromatic masala for delicious biriyani.", "Medium", "100 g", 60),
    ("Chicken Masala", "Special Masalas", 110, 135, 4, "chicken-masala.png", "A flavourful spice blend for chicken dishes.", "Medium", "100 g", 70),
    ("Mutton Masala", "Special Masalas", 130, 155, 5, "mutton-masala.png", "Rich and aromatic masala for mutton recipes.", "Spicy", "100 g", 5),
    ("Traditional Sambar Masala", "South Indian Masalas", 90, 110, 4, "sambar-masala.png", "Traditional spices for flavourful sambar.", "Medium", "200 g", 90),
    ("Homemade Rasam Masala", "South Indian Masalas", 85, 100, 4, "rasam-masala.png", "Aromatic spice mix for traditional rasam.", "Mild", "100 g", 85),
]

RECIPES = [
    ("Spicy Chicken Curry", "chicken.png", "40 Minutes", "4 People", "Chicken Masala",
     ["Chicken", "Onion", "Tomato", "Ginger garlic paste", "Chicken Masala"],
     ["Clean the chicken and keep it ready.", "Heat oil, fry onions and add ginger garlic paste.",
      "Add tomatoes, turmeric, chilli powder and coriander powder. Cook well.",
      "Add chicken, mix well and cook until almost done.",
      "Add 2 tbsp Chicken Masala, a little water and cook until tender. Garnish and serve hot."]),
    ("Traditional Masala Rice", "biriyani-masala.jpeg", "35 Minutes", "4 People", "Special Biriyani Masala",
     ["Rice", "Onion", "Tomato", "Vegetables", "Biriyani Masala"],
     ["Wash the rice and keep it ready.", "Heat oil, fry onions and add ginger garlic paste.",
      "Add tomatoes and vegetables and cook well.", "Add 2 tbsp Biriyani Masala and mix well.",
      "Add rice, water and salt. Cook until soft and garnish with coriander."]),
    ("South Indian Sambar", "sambar-masala.jpeg", "30 Minutes", "4 People", "Traditional Sambar Masala",
     ["Toor dal", "Vegetables", "Tamarind", "Sambar Masala"],
     ["Cook the dal until soft.", "Boil vegetables with tamarind water.",
      "Add 2 tbsp Sambar Masala and simmer.", "Mix in the dal and temper with mustard and curry leaves."]),
]

COUPONS = [
    ("WELCOME10", "10% off your first order", "percent", 10, 199, 100, None),
    ("FLAT50", "Rs. 50 off above Rs. 500", "flat", 50, 500, None, None),
    ("FESTIVE20", "Festival offer - 20% off (max Rs. 150)", "percent", 20, 300, 150, 500),
]


def run() -> None:
    ensure_database()
    Base.metadata.create_all(bind=engine)
    ensure_admin()
    with SessionLocal() as db:
        cats = {}
        for name, (desc, img) in CATEGORIES.items():
            c = db.scalar(select(Category).where(Category.name == name))
            if not c:
                c = Category(name=name, slug=slugify(name), description=desc, image=img)
                db.add(c)
            cats[name] = c
        db.flush()

        prods = {}
        for n, cat, price, mrp, rating, img, desc, spice, wt, stock in PRODUCTS:
            p = db.scalar(select(Product).where(Product.slug == slugify(n)))
            if not p:
                p = Product(
                    name=n, slug=slugify(n), category_id=cats[cat].id, price=price, original_price=mrp,
                    image=f"/images/{img}", description=desc, spice_level=spice, net_weight=wt,
                    stock=stock, rating=rating, rating_count=0, is_featured=rating >= 5,
                    shelf_life="9 months", ingredients="100% natural, no added colours or preservatives",
                )
                db.add(p)
            prods[n] = p
        db.flush()

        for title, img, t, serv, prod, ing, steps in RECIPES:
            if not db.scalar(select(Recipe).where(Recipe.slug == slugify(title))):
                db.add(Recipe(title=title, slug=slugify(title), image=f"/images/{img}", cook_time=t,
                              servings=serv, ingredients=ing, steps=steps, products=[prods[prod]]))

        for code, desc, typ, val, minimum, cap, limit in COUPONS:
            if not db.scalar(select(Coupon).where(Coupon.code == code)):
                db.add(Coupon(code=code, description=desc, discount_type=typ, value=val, min_order=minimum,
                              max_discount=cap, usage_limit=limit,
                              expires_at=datetime.now() + timedelta(days=90)))
        db.commit()
    print("Seed done. Admin login -> see ADMIN_EMAIL / ADMIN_PASSWORD in .env")


if __name__ == "__main__":
    run()
