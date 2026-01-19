"use client";

import { JSX, useState } from "react";
import { CirclePlus, Utensils } from "lucide-react";
import Image from "next/image";

// types.ts - TypeScript interfaces for Harrison House Menu

/**
 * Base menu item interface
 */
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

/**
 * Cart item extends MenuItem with quantity
 */
export interface CartItem extends MenuItem {
  quantity: number;
}

/**
 * Category metadata interface
 */
export interface Category {
  id: string;
  title: string;
  subtitle: string | null;
  showHeader: boolean;
  icon: string | null;
}

/**
 * Menu data structure - maps category IDs to their menu items
 */
export interface MenuData {
  [categoryId: string]: MenuItem[];
}

/**
 * Props for MenuItemCard component
 */
export interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (itemId: number) => void;
}

/**
 * Props for CartItem component
 */
export interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, change: number) => void;
  onRemove: (itemId: number) => void;
}

/**
 * Props for MenuSection component (if you decide to create one)
 */
export interface MenuSectionProps {
  category: Category;
  items: MenuItem[];
  onAddToCart: (itemId: number) => void;
}

/**
 * Cart state interface
 */
export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Menu data with category metadata
const categories: Category[] = [
  {
    id: "Ala Carte & Grill",
    title: "Ala Carte & Grill",
    subtitle: "Most ordered right now.",
    showHeader: true,
    icon: "👍",
  },
  {
    id: "Harrison Traditions",
    title: "Harrison Traditions",
    subtitle: null,
    showHeader: false,
    icon: null,
  },
  {
    id: "Harrison Bonding Bites",
    title: "Harrison Bonding Bites",
    subtitle: null,
    showHeader: false,
    icon: null,
  },
  {
    id: "Harrison Full Plates",
    title: "Harrison Full Plates",
    subtitle: null,
    showHeader: false,
    icon: null,
  },
  {
    id: "Harrison Refreshment",
    title: "Harrison Refreshment",
    subtitle: null,
    showHeader: false,
    icon: null,
  },
  {
    id: "Add-ons",
    title: "Add-ons",
    subtitle: null,
    showHeader: false,
    icon: null,
  },
];

const menuData: MenuData = {
  "Ala Carte & Grill": [
    {
      id: 1,
      name: "Chicken Liver",
      price: 79,
      description:
        "Crispylicious, juicylicious Chickenjoy paired with the tastiest and meatiest...",
      image: "/images/202.png",
    },
    {
      id: 2,
      name: "Chicken Wings",
      price: 89,
      description:
        "The Best Fried Chicken! Crispylicious, Juicylicious! Jollibee's perfectly...",
      image: "/images/144.png",
    },
    {
      id: 3,
      name: "Pecho",
      price: 209,
      description:
        "Philippines' best-tasting crispylicious, juicylicious Chickenjoy with refreshin...",
      image: "/images/145.png",
    },
    {
      id: 4,
      name: "Chicken Leg Quarter",
      price: 189,
      description: "",
      image: "/images/248.png",
    },
    {
      id: 5,
      name: "Ehsaladang Talong",
      price: 149,
      description: "",
      image: "/images/253.png",
    },
    {
      id: 6,
      name: "Chicken Gizzard",
      price: 79,
      description: "",
      image: "/images/255.png",
    },
    {
      id: 61,
      name: "Chicken BBQ",
      price: 89,
      description: "",
      image: "/images/256.png",
    },
    {
      id: 62,
      name: "Pork BBQ",
      price: 89,
      description: "",
      image: "/images/257.png",
    },
  ],
  "Harrison Traditions": [
    {
      id: 7,
      name: "Lechon Kawali",
      price: 399,
      description:
        "Crispy pork belly with juicy meat inside, served with liver sauce or spiced vinegar.",
      image: "/images/205.png",
    },
    {
      id: 8,
      name: "Lumpiang Shanghai",
      price: 199,
      description:
        "Golden spring rolls stuffed with seasoned, pork and veggies, paired with sweet chili dip",
      image: "/images/206.png",
    },
    {
      id: 9,
      name: "Sisig Turon",
      price: 79,
      description:
        "Sisig wrapped in lumpia skin, deepfried to a crisp. A fun, savory snack",
      image: "/images/207.png",
    },
    {
      id: 10,
      name: "Adobong Kangkong",
      price: 99,
      description:
        "Water spinach sautéed in soy-vinegar, garlic sauce. Simple, earthy, and satisfying.",
      image: "/images/209.png",
    },
    {
      id: 101,
      name: "Pancit Canton",
      price: 299,
      description:
        "Stir-fried egg noodles with pork, shrimp,sausage, and mixed vegetables in savory sauce.",
      image: "/images/216.png",
    },
    {
      id: 102,
      name: "Pork Sinigang",
      price: 399,
      description:
        "Tamarind-based soup with pork ribs, gabi, radish,eggplant, and kangkong. Tangy and comforting.",
      image: "/images/221.png",
    },
    {
      id: 103,
      name: "Harrison Sisig",
      price: 399,
      description:
        "Sizzling chopped pork with calamansi,onions, chili, and egg on a hot plate.",
      image: "/images/222.png",
    },
  ],
  "Harrison Bonding Bites": [
    {
      id: 11,
      name: "The Juicy Gathering",
      price: 1499,
      description:
        "Includes 4 pcs Chicken Pecho, 4 pcs Pork BBQ, aserving of Pancit, and 4 servings of Rice. A hearty,meaty feast for small groups.",
      image: "/images/176.png",
    },
    {
      id: 12,
      name: "WINGS MEET QUARTERS",
      price: 1399,
      description:
        "Includes 4 pcs Leg Quarter, 4 pcs Chicken Wings, aserving of Pancit, and 4 servings of Rice. Juicy andflavorful, perfect for friends or family to share.",
      image: "/images/175.png",
    },
    {
      id: 13,
      name: "Stick It Together",
      price: 999,
      description:
        "Includes 4 pcs Pork BBQ, 4 pcs Chicken BBQ, aserving of Pancit, and 4 servings of Rice. Perfectfor sharing with friends or barkada.",
      image: "/images/177.png",
    },
  ],
  "Add-ons": [
    {
      id: 14,
      name: "Atchara",
      price: 19,
      description: "",
      image: "/images/228.png",
    },
    {
      id: 15,
      name: "Plain Rice",
      price: 39,
      description: "",
      image: "/images/275.png",
    },
  ],
  "Harrison Full Plates": [
    {
      id: 16,
      name: "Pork BBQ Combo",
      price: 199,
      description: "2PCS PORK SKEWERS + RICE + ATCHARA",
      image: "/images/243.png",
    },
  ],
  "Harrison Refreshment": [
    {
      id: 20,
      name: "Mountain Dew",
      price: 99,
      description: "",
      image: "/images/159.png",
    },
    {
      id: 21,
      name: "Sprite",
      price: 99,
      description: "",
      image: "/images/160.png",
    },
    {
      id: 22,
      name: "Royal",
      price: 99,
      description: "",
      image: "/images/161.png",
    },
    {
      id: 23,
      name: "Super Dry",
      price: 99,
      description: "",
      image: "/images/163.png",
    },
    {
      id: 24,
      name: "Red Horse",
      price: 99,
      description: "",
      image: "/images/164.png",
    },
    {
      id: 25,
      name: "San Mig Apple",
      price: 99,
      description: "",
      image: "/images/165.png",
    },
    {
      id: 26,
      name: "Pale Pilsen",
      price: 99,
      description: "",
      image: "/images/166.png",
    },
    {
      id: 27,
      name: "San Mig Light",
      price: 99,
      description: "",
      image: "/images/167.png",
    },
  ],
};

// Menu Item Card Component
const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white hover:bg-red-50 shadow-sm hover:shadow-md transition-shadow relative rounded-lg p-6 border border-gray-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 text-slate-700">{item.name}</h3>
          <p className="text-slate-900 mb-2">from PHP {item.price}</p>
          {item.description && (
            <p className="text-md text-gray-500">{item.description}</p>
          )}
        </div>
        <div className="ml-4 relative">
          <Image src={item.image} alt={item.name} width={120} height={120} />
          <button
            onClick={() => onAddToCart(item.id)}
            className="absolute -bottom-2 -right-2 bg-white rounded-full flex items-center justify-center text-xl hover:bg-gray-50 hover:border-red-600 transition-all cursor-pointer"
            aria-label={`Add ${item.name} to cart`}
          >
            <CirclePlus className="text-orange-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between py-3">
      <img src={item.image} alt={item.name} className="mx-2 h-12 w-12" />
      <div className="flex-1">
        <p className="font-semibold text-sm text-slate-600">{item.name}</p>
        <p className="text-xs text-gray-600">₱ {item.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-6 text-center font-semibold text-slate-600">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 text-slate-600 cursor-pointer"
          aria-label="Increase quantity"
        >
          +
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="ml-2 text-red-600 hover:text-red-800 text-sm"
          aria-label={`Remove ${item.name} from cart`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Main Menu Page Component
export default function MenuPage(): JSX.Element {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Add item to cart
  const addToCart = (itemId: number): void => {
    const allItems: MenuItem[] = Object.values(menuData).flat();
    const item = allItems.find((item) => item.id === itemId);

    if (!item) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === itemId);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Update quantity
  const updateQuantity = (itemId: number, change: number): void => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  // Remove from cart
  const removeFromCart = (itemId: number): void => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Calculate total
  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Handle checkout
  const handleCheckout = (): void => {
    if (cart.length > 0) {
      alert(
        `Proceeding to checkout with ${cart.length} item(s). Total: ₱${calculateTotal()}`,
      );
    }
  };

  return (
    <div className="bg-gray-50">
      <main className="mx-auto flex justify-center">
        <section className="max-w-7xl flex justify-center gap-2 h-screen">
          {/* Menu Items Section */}
          <div className="flex-1 overflow-y-auto p-6 max-h-screen no-scrollbar">
            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {categories.map((category) => {
              const items = menuData[category.id] || [];
              return (
                <div
                  key={category.id}
                  id={`${category.id}Section`}
                  className="scroll-mt-24 mb-8"
                >
                  <h2 className="text-4xl font-bold mb-6 text-orange-500">
                    {category.title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Sidebar */}
          <aside className="w-90 sticky top-0 h-screen pt-20">
            <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-6 border border-gray-300">
              {/* Empty Cart */}
              {cart.length === 0 && (
                <div className="flex flex-col justify-center items-center mb-6 min-h-[50vh]">
                  <div className="flex justify-center p-5">
                    <p className="p-4 bg-orange-100 rounded-full">
                      <Utensils className="text-orange-500" />
                    </p>
                  </div>
                  <p className="text-lg text-slate-600 font-bold">
                    Order your favourite!
                  </p>
                  <p className="text-slate-400 text-sm">Your cart is empty</p>
                </div>
              )}

              {/* Cart Items */}
              {cart.length > 0 && (
                <div className="mb-4">
                  {cart.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}

              {/* Payment Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-slate-700">
                    Total
                    <span className="text-xs text-gray-500">
                      {" "}
                      (incl. fees and tax)
                    </span>
                  </span>
                  <span className="font-bold text-lg text-slate-700">
                    ₱ {calculateTotal()}
                  </span>
                </div>

                {cart.length > 0 && (
                  <button className="text-red-600 text-sm font-semibold mb-4">
                    See summary
                  </button>
                )}

                <button
                  onClick={handleCheckout}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    cart.length > 0
                      ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={cart.length === 0}
                >
                  Review payment and address
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
