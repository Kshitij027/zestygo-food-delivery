import { CartItem } from "hooks/CartContext";

export type Category = "All" | "Pizza" | "Burger" | "Biryani" | "Drinks" | "Salads" | "Tacos" | "Pasta" | "Chinese";

export interface Restaurant extends CartItem {
  category: Category;
  cuisine: string;
  discount?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

/* ── Menu item type ─────────────────────────────────────────────────── */
export interface MenuItem {
  id: number;           // unique across all items
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;     // section within the restaurant menu
  rating: number;
  deliveryTime: string; // inherited for cart compat
  isVeg: boolean;
  isBestseller?: boolean;
  isSpicy?: boolean;
}

export const categories: Category[] = ["All", "Pizza", "Burger", "Biryani", "Drinks", "Salads", "Tacos", "Pasta", "Chinese"];

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Spice Route Kitchen",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    price: 299,
    rating: 4.6,
    deliveryTime: "28 mins",
    category: "Pizza",
    cuisine: "Italian · Pizza",
    discount: "20% OFF",
    isPopular: true,
  },
  {
    id: 2,
    name: "Burger Bay",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    price: 229,
    rating: 4.3,
    deliveryTime: "24 mins",
    category: "Burger",
    cuisine: "American · Burgers",
    discount: "Free Drink",
    isPopular: true,
  },
  {
    id: 3,
    name: "Pasta Lab",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80",
    price: 259,
    rating: 4.5,
    deliveryTime: "32 mins",
    category: "Pasta",
    cuisine: "Italian · Pasta",
  },
  {
    id: 4,
    name: "Biryani House",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    price: 319,
    rating: 4.7,
    deliveryTime: "30 mins",
    category: "Biryani",
    cuisine: "Indian · Biryani",
    discount: "10% OFF",
    isPopular: true,
  },
  {
    id: 5,
    name: "Green Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    price: 199,
    rating: 4.2,
    deliveryTime: "21 mins",
    category: "Salads",
    cuisine: "Healthy · Salads",
    isNew: true,
  },
  {
    id: 6,
    name: "Taco Town",
    image: "https://images.unsplash.com/photo-1604467715878-83e57e8bc129?auto=format&fit=crop&w=800&q=80",
    price: 249,
    rating: 4.4,
    deliveryTime: "26 mins",
    category: "Tacos",
    cuisine: "Mexican · Tacos",
    isNew: true,
  },
  {
    id: 7,
    name: "Dragon Wok",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    price: 279,
    rating: 4.1,
    deliveryTime: "35 mins",
    category: "Chinese",
    cuisine: "Chinese · Noodles",
    discount: "15% OFF",
  },
  {
    id: 8,
    name: "Sip & Brew",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
    price: 149,
    rating: 4.5,
    deliveryTime: "18 mins",
    category: "Drinks",
    cuisine: "Beverages · Café",
    isNew: true,
  },
];

/* ── Menu items per restaurant ────────────────────────────────────── */
export const menuItems: MenuItem[] = [
  /* ── Spice Route Kitchen (id: 1) — Pizza ── */
  { id: 101, restaurantId: 1, name: "Margherita Pizza", description: "Classic San Marzano tomato base, fresh mozzarella, basil, extra-virgin olive oil. Simple, perfect.", price: 279, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80", category: "Signature Pizzas", rating: 4.6, deliveryTime: "28 mins", isVeg: true, isBestseller: true },
  { id: 102, restaurantId: 1, name: "Spicy Chicken BBQ Pizza", description: "Smoky BBQ sauce, grilled chicken strips, caramelised onion, jalapeños, stretchy mozzarella.", price: 349, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", category: "Signature Pizzas", rating: 4.7, deliveryTime: "28 mins", isVeg: false, isBestseller: true, isSpicy: true },
  { id: 103, restaurantId: 1, name: "Peri Peri Paneer Pizza", description: "Peri-peri marinated paneer, bell peppers, olives, chilli drizzle on a garlic-herb crust.", price: 319, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", category: "Signature Pizzas", rating: 4.4, deliveryTime: "28 mins", isVeg: true, isSpicy: true },
  { id: 104, restaurantId: 1, name: "Truffle Mushroom Pizza", description: "Wild mushrooms, truffle oil, parmesan shavings, rosemary, creamy bechamel base.", price: 389, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80", category: "Gourmet Pizzas", rating: 4.8, deliveryTime: "28 mins", isVeg: true },
  { id: 105, restaurantId: 1, name: "Garlic Bread with Cheese", description: "Freshly baked focaccia, roasted garlic butter, mozz & cheddar blend, baked golden.", price: 149, image: "https://images.unsplash.com/photo-1619221651452-f4e4c18d5f62?auto=format&fit=crop&w=600&q=80", category: "Sides", rating: 4.5, deliveryTime: "28 mins", isVeg: true, isBestseller: true },
  { id: 106, restaurantId: 1, name: "Tiramisu", description: "Classic Italian dessert — espresso-soaked ladyfingers, mascarpone cream, dusted cocoa.", price: 199, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80", category: "Desserts", rating: 4.6, deliveryTime: "28 mins", isVeg: true },

  /* ── Burger Bay (id: 2) — Burgers ── */
  { id: 201, restaurantId: 2, name: "Classic Smash Burger", description: "Double smash patty, American cheese, pickles, mustard aioli, brioche bun. The OG.", price: 249, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", category: "Burgers", rating: 4.6, deliveryTime: "24 mins", isVeg: false, isBestseller: true },
  { id: 202, restaurantId: 2, name: "Crispy Chicken Burger", description: "Southern fried chicken thigh, coleslaw, sriracha mayo, pickled jalapeños on a toasted bun.", price: 229, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80", category: "Burgers", rating: 4.5, deliveryTime: "24 mins", isVeg: false, isSpicy: true },
  { id: 203, restaurantId: 2, name: "BBQ Bacon Cheese Burger", description: "Triple-smash patty, streaky bacon, cheddar, smoky BBQ sauce, caramelised onions.", price: 319, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80", category: "Burgers", rating: 4.7, deliveryTime: "24 mins", isVeg: false, isBestseller: true },
  { id: 204, restaurantId: 2, name: "Veggie Black Bean Burger", description: "House-made black bean patty, avocado, cheddar, pico de gallo, herb aioli, sesame bun.", price: 199, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80", category: "Burgers", rating: 4.2, deliveryTime: "24 mins", isVeg: true },
  { id: 205, restaurantId: 2, name: "Loaded Cheese Fries", description: "Hand-cut fries, nacho cheese sauce, jalapeños, sour cream, green onions.", price: 149, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", category: "Sides", rating: 4.4, deliveryTime: "24 mins", isVeg: true, isBestseller: true },
  { id: 206, restaurantId: 2, name: "Strawberry Milkshake", description: "Thick and creamy strawberry milkshake topped with whipped cream and a cherry.", price: 129, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", category: "Drinks", rating: 4.3, deliveryTime: "24 mins", isVeg: true },

  /* ── Pasta Lab (id: 3) — Pasta ── */
  { id: 301, restaurantId: 3, name: "Spaghetti Carbonara", description: "Al dente spaghetti, guanciale, egg yolk, pecorino romano, cracked black pepper. No cream.", price: 289, image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80", category: "Classic Pasta", rating: 4.7, deliveryTime: "32 mins", isVeg: false, isBestseller: true },
  { id: 302, restaurantId: 3, name: "Penne Arrabbiata", description: "Spicy tomato sauce, garlic, fresh chillies, basil, parmesan. A fiery Italian classic.", price: 249, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80", category: "Classic Pasta", rating: 4.4, deliveryTime: "32 mins", isVeg: true, isSpicy: true },
  { id: 303, restaurantId: 3, name: "Pesto Chicken Pasta", description: "Fettuccine, basil pesto, grilled chicken, cherry tomatoes, pine nuts, parmesan.", price: 319, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80", category: "Chef's Specials", rating: 4.6, deliveryTime: "32 mins", isVeg: false, isBestseller: true },
  { id: 304, restaurantId: 3, name: "Lasagne Bolognese", description: "Slow-cooked beef ragu, béchamel, fresh pasta sheets, parmesan, oven-baked till golden.", price: 349, image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80", category: "Chef's Specials", rating: 4.8, deliveryTime: "32 mins", isVeg: false },
  { id: 305, restaurantId: 3, name: "Mushroom Ravioli", description: "House-made ravioli filled with ricotta & wild mushrooms, sage brown butter, parmesan.", price: 299, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80", category: "Chef's Specials", rating: 4.5, deliveryTime: "32 mins", isVeg: true },
  { id: 306, restaurantId: 3, name: "Bruschetta", description: "Toasted ciabatta, diced tomatoes, fresh basil, garlic, extra-virgin olive oil, sea salt.", price: 169, image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=600&q=80", category: "Starters", rating: 4.3, deliveryTime: "32 mins", isVeg: true },

  /* ── Biryani House (id: 4) — Biryani ── */
  { id: 401, restaurantId: 4, name: "Hyderabadi Chicken Biryani", description: "Aged basmati, slow-dum-cooked chicken, saffron, caramelised onions, mint. Served with raita.", price: 349, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", category: "Biryani", rating: 4.8, deliveryTime: "30 mins", isVeg: false, isBestseller: true },
  { id: 402, restaurantId: 4, name: "Mutton Biryani", description: "Tender mutton on the bone, kewra water, long-grained basmati, slow-cooked dum style.", price: 419, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80", category: "Biryani", rating: 4.7, deliveryTime: "30 mins", isVeg: false },
  { id: 403, restaurantId: 4, name: "Veg Biryani", description: "Seasonal vegetables, dry fruits, saffron, basmati — slow-cooked dum style.", price: 279, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80", category: "Biryani", rating: 4.4, deliveryTime: "30 mins", isVeg: true, isBestseller: true },
  { id: 404, restaurantId: 4, name: "Chicken Korma", description: "Tender chicken in a rich, creamy almond-cashew gravy with whole spices. Pairs perfectly with naan.", price: 299, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80", category: "Curries", rating: 4.6, deliveryTime: "30 mins", isVeg: false },
  { id: 405, restaurantId: 4, name: "Dal Makhani", description: "Black lentils slow-cooked overnight, butter, cream, tomatoes. A north Indian staple.", price: 229, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", category: "Curries", rating: 4.5, deliveryTime: "30 mins", isVeg: true },
  { id: 406, restaurantId: 4, name: "Seekh Kebab (6 pcs)", description: "Minced lamb, ginger, green chilli, coriander — charcoal-grilled on skewers. Served with mint chutney.", price: 269, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80", category: "Starters", rating: 4.6, deliveryTime: "30 mins", isVeg: false, isSpicy: true },

  /* ── Green Bowl (id: 5) — Salads ── */
  { id: 501, restaurantId: 5, name: "Caesar Salad", description: "Romaine, house Caesar dressing, parmesan shavings, anchovy-free croutons, lemon zest.", price: 219, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80", category: "Salads", rating: 4.4, deliveryTime: "21 mins", isVeg: true, isBestseller: true },
  { id: 502, restaurantId: 5, name: "Rainbow Buddha Bowl", description: "Quinoa, roasted chickpeas, avocado, beets, edamame, tahini dressing, seeds.", price: 259, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80", category: "Bowls", rating: 4.5, deliveryTime: "21 mins", isVeg: true, isBestseller: true },
  { id: 503, restaurantId: 5, name: "Grilled Chicken Salad", description: "Herb-marinated grilled chicken, mixed greens, cherry tomatoes, cucumber, balsamic glaze.", price: 289, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", category: "Salads", rating: 4.3, deliveryTime: "21 mins", isVeg: false },
  { id: 504, restaurantId: 5, name: "Watermelon Feta Salad", description: "Seedless watermelon, crumbled feta, mint, black olives, lime-honey dressing.", price: 199, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80", category: "Salads", rating: 4.2, deliveryTime: "21 mins", isVeg: true },
  { id: 505, restaurantId: 5, name: "Green Smoothie", description: "Spinach, banana, almond milk, chia seeds, ginger. Zero added sugar.", price: 149, image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80", category: "Drinks", rating: 4.4, deliveryTime: "21 mins", isVeg: true },

  /* ── Taco Town (id: 6) — Tacos ── */
  { id: 601, restaurantId: 6, name: "Carne Asada Tacos (3)", description: "Marinated grilled flank steak, white onion, cilantro, salsa verde, corn tortillas.", price: 279, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80", category: "Tacos", rating: 4.6, deliveryTime: "26 mins", isVeg: false, isBestseller: true },
  { id: 602, restaurantId: 6, name: "Fish Tacos (3)", description: "Beer-battered fish, red cabbage slaw, chipotle crema, lime, corn tortillas.", price: 259, image: "https://images.unsplash.com/photo-1604467715878-83e57e8bc129?auto=format&fit=crop&w=600&q=80", category: "Tacos", rating: 4.5, deliveryTime: "26 mins", isVeg: false },
  { id: 603, restaurantId: 6, name: "Jackfruit Tacos (3)", description: "Slow-braised spiced jackfruit, pickled onions, avocado, salsa roja, corn tortillas.", price: 239, image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&q=80", category: "Tacos", rating: 4.3, deliveryTime: "26 mins", isVeg: true, isBestseller: true },
  { id: 604, restaurantId: 6, name: "Chicken Quesadilla", description: "Grilled flour tortilla, shredded chicken, cheddar, peppers, sour cream, guac.", price: 229, image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80", category: "Sides", rating: 4.4, deliveryTime: "26 mins", isVeg: false },
  { id: 605, restaurantId: 6, name: "Nachos Grande", description: "Tortilla chips, cheese sauce, pico de gallo, jalapeños, sour cream, guacamole.", price: 199, image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80", category: "Sides", rating: 4.5, deliveryTime: "26 mins", isVeg: true, isSpicy: true },

  /* ── Dragon Wok (id: 7) — Chinese ── */
  { id: 701, restaurantId: 7, name: "Hakka Noodles", description: "Wok-tossed noodles, mixed vegetables, soy sauce, sesame oil. Classic Indo-Chinese.", price: 229, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80", category: "Noodles & Rice", rating: 4.3, deliveryTime: "35 mins", isVeg: true, isBestseller: true },
  { id: 702, restaurantId: 7, name: "Chilli Chicken", description: "Crispy chicken tossed in dragon sauce, bell peppers, spring onion, soy, chilli.", price: 269, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80", category: "Starters", rating: 4.5, deliveryTime: "35 mins", isVeg: false, isBestseller: true, isSpicy: true },
  { id: 703, restaurantId: 7, name: "Dimsums (6 pcs)", description: "Steamed pork & prawn dimsums, served with soy-chilli dipping sauce.", price: 249, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80", category: "Starters", rating: 4.4, deliveryTime: "35 mins", isVeg: false },
  { id: 704, restaurantId: 7, name: "Veg Fried Rice", description: "Wok-fried basmati, mixed vegetables, egg-free, soy glaze, scallions.", price: 219, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80", category: "Noodles & Rice", rating: 4.2, deliveryTime: "35 mins", isVeg: true },
  { id: 705, restaurantId: 7, name: "Kung Pao Tofu", description: "Crispy tofu, peanuts, dried chillies, Sichuan peppercorn, hoisin sauce.", price: 259, image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80", category: "Mains", rating: 4.1, deliveryTime: "35 mins", isVeg: true, isSpicy: true },

  /* ── Sip & Brew (id: 8) — Drinks/Café ── */
  { id: 801, restaurantId: 8, name: "Cold Brew Coffee", description: "12-hour steeped Colombian cold brew, served over ice. Smooth, low-acid, satisfying.", price: 149, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80", category: "Cold Drinks", rating: 4.6, deliveryTime: "18 mins", isVeg: true, isBestseller: true },
  { id: 802, restaurantId: 8, name: "Caramel Latte", description: "Double espresso, steamed oat milk, housemade caramel drizzle. Hot or iced.", price: 169, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80", category: "Hot Drinks", rating: 4.5, deliveryTime: "18 mins", isVeg: true },
  { id: 803, restaurantId: 8, name: "Mango Passion Fruit Smoothie", description: "Fresh Alphonso mango, passion fruit pulp, coconut water, lime. Pure tropical bliss.", price: 179, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80", category: "Smoothies", rating: 4.7, deliveryTime: "18 mins", isVeg: true, isBestseller: true },
  { id: 804, restaurantId: 8, name: "Blueberry Cheesecake", description: "Creamy New York-style cheesecake, blueberry compote, graham cracker crust.", price: 199, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80", category: "Desserts", rating: 4.5, deliveryTime: "18 mins", isVeg: true },
  { id: 805, restaurantId: 8, name: "Avocado Toast", description: "Sourdough, smashed avocado, cherry tomatoes, poached egg, chilli flakes, micro greens.", price: 169, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80", category: "Bites", rating: 4.4, deliveryTime: "18 mins", isVeg: true },
];

/* ── Helpers ─────────────────────────────────────────────────────── */
export const getRestaurantById = (id: number) => restaurants.find((r) => r.id === id);
export const getMenuByRestaurant = (restaurantId: number) => menuItems.filter((m) => m.restaurantId === restaurantId);
export const getMenuSections = (restaurantId: number): string[] =>
  Array.from(new Set(getMenuByRestaurant(restaurantId).map((m) => m.category)));
