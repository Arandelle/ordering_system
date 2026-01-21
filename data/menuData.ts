import { Category, MenuData } from "@/types/MenuTypes";

export const categories: Category[] = [
  {
    id: "All",
    title: "All",
    subtitle: "",
    showHeader: true,
    icon: "👍",
  },
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

export const menuData: MenuData = {
  "Ala Carte & Grill": [
    {
      id: 1,
      name: "Chicken Liver",
      price: 79,
      description:
        "Crispylicious, juicylicious Chickenjoy paired with the tastiest and meatiest...",
      isBestSeller: true,
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
      isBestSeller: true,
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
      isBestSeller: true,
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
    {
      id: 17,
      name: "Chicken BBQ Combo",
      price: 199,
      description: "2 CHICKEN SKEWERS + RICE + ATCHARA",
      image: "/images/141.png",
    },
    {
      id: 18,
      name: "Leg Quarter Combo",
      price: 199,
      description: "1 LEG QUARTER + RICE + ATCHARA",
      image: "/images/142.png",
    },
    {
      id: 19,
      name: "Chicken Wings Combo",
      price: 199,
      description: "2 CHICKEN WINGS + RICE + ATCHARA",
      isBestSeller: true,
      image: "/images/146.png",
    },
    {
      id: 191,
      name: "Chicken Pecho Combo",
      price: 219,
      description: "1 PECHO INASAL + RICE + ATCHARA",
      image: "/images/143.png",
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
      isBestSeller: true,
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
