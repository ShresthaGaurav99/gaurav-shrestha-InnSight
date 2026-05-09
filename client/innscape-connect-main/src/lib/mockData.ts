import deluxe from "@/assets/room-deluxe.jpg";
import executive from "@/assets/room-executive.jpg";
import presidential from "@/assets/room-presidential.jpg";
import standard from "@/assets/room-standard.jpg";

export type Room = {
  id: string;
  name: string;
  type: "Standard" | "Deluxe" | "Executive" | "Presidential";
  price: number; // NPR / night
  rating: number;
  capacity: number;
  beds: string;
  size: number; // sqm
  image: string;
  gallery: string[];
  amenities: string[];
  description: string;
};

export const rooms: Room[] = [
  {
    id: "deluxe-king",
    name: "Deluxe Mountain Suite",
    type: "Deluxe",
    price: 12500,
    rating: 4.9,
    capacity: 2,
    beds: "1 King",
    size: 42,
    image: deluxe,
    gallery: [deluxe, executive, standard],
    amenities: ["Wifi", "Breakfast", "Mountain View", "Mini Bar", "Air Conditioning", "Smart TV"],
    description:
      "An elegant retreat with floor-to-ceiling windows framing the Himalayas. Plush king bed, marble bath, and warm ambient lighting designed for restorative stays.",
  },
  {
    id: "executive-twin",
    name: "Executive Twin Room",
    type: "Executive",
    price: 8900,
    rating: 4.7,
    capacity: 2,
    beds: "2 Twin",
    size: 32,
    image: executive,
    gallery: [executive, standard, deluxe],
    amenities: ["Wifi", "Workspace", "Breakfast", "Air Conditioning", "Smart TV"],
    description:
      "A bright, minimalist space ideal for business travellers. Ergonomic workspace, premium linens, and a tranquil atmosphere.",
  },
  {
    id: "presidential",
    name: "Presidential Skyline Suite",
    type: "Presidential",
    price: 38500,
    rating: 5.0,
    capacity: 4,
    beds: "1 King + Lounge",
    size: 110,
    image: presidential,
    gallery: [presidential, deluxe, executive],
    amenities: ["Wifi", "Private Lounge", "Butler", "Fireplace", "City View", "Bar", "Spa Bath"],
    description:
      "Our most distinguished residence. Panoramic skyline views, dedicated butler service, and curated interiors finished in navy and gold.",
  },
  {
    id: "standard-queen",
    name: "Classic Queen Room",
    type: "Standard",
    price: 5400,
    rating: 4.5,
    capacity: 2,
    beds: "1 Queen",
    size: 24,
    image: standard,
    gallery: [standard, executive, deluxe],
    amenities: ["Wifi", "Breakfast", "Air Conditioning", "Smart TV"],
    description:
      "Comfort-first essentials, thoughtfully designed. The perfect choice for short getaways without compromise.",
  },
];

export type Booking = {
  id: string;
  roomId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: "Active" | "Upcoming" | "Completed" | "Cancelled";
  total: number;
};

export const bookings: Booking[] = [
  { id: "BK-10293", roomId: "deluxe-king", guestName: "Aarav Sharma", checkIn: "2026-05-12", checkOut: "2026-05-15", status: "Active", total: 37500 },
  { id: "BK-10294", roomId: "executive-twin", guestName: "Aarav Sharma", checkIn: "2026-06-01", checkOut: "2026-06-03", status: "Upcoming", total: 17800 },
  { id: "BK-10211", roomId: "standard-queen", guestName: "Aarav Sharma", checkIn: "2026-02-10", checkOut: "2026-02-12", status: "Completed", total: 10800 },
];

export type MenuItem = {
  id: string;
  name: string;
  category: "Breakfast" | "Mains" | "Drinks" | "Desserts";
  price: number;
  description: string;
};

export const menu: MenuItem[] = [
  { id: "m1", name: "Himalayan Breakfast Platter", category: "Breakfast", price: 1450, description: "Eggs, sausage, beans, sourdough, seasonal fruit." },
  { id: "m2", name: "Truffle Mushroom Risotto", category: "Mains", price: 1850, description: "Arborio rice, wild mushrooms, parmesan, truffle oil." },
  { id: "m3", name: "Grilled Atlantic Salmon", category: "Mains", price: 2400, description: "Lemon butter, asparagus, fingerling potatoes." },
  { id: "m4", name: "Masala Chai", category: "Drinks", price: 320, description: "House blend, cardamom, ginger." },
  { id: "m5", name: "Tiramisu Classico", category: "Desserts", price: 780, description: "Espresso-soaked savoiardi, mascarpone." },
];

export const stats = {
  revenue: 4_850_000,
  occupancy: 87,
  activeGuests: 142,
  bookingsToday: 23,
  newUsers: 38,
};

export const revenueWeek = [
  { day: "Mon", value: 540000 },
  { day: "Tue", value: 620000 },
  { day: "Wed", value: 480000 },
  { day: "Thu", value: 710000 },
  { day: "Fri", value: 860000 },
  { day: "Sat", value: 940000 },
  { day: "Sun", value: 700000 },
];

export type StaffOrder = {
  id: string;
  room: string;
  guest: string;
  items: string;
  status: "Pending" | "In progress" | "Delivered";
  time: string;
};

export const staffOrders: StaffOrder[] = [
  { id: "OR-501", room: "Room 412", guest: "Aarav Sharma", items: "Truffle Risotto × 1, Masala Chai × 2", status: "Pending", time: "12 min ago" },
  { id: "OR-502", room: "Room 308", guest: "M. Khadka", items: "Atlantic Salmon × 1", status: "In progress", time: "20 min ago" },
  { id: "OR-503", room: "Suite 901", guest: "S. Tamang", items: "Tiramisu × 2", status: "Delivered", time: "1 hr ago" },
];

export const todayCheckins = [
  { name: "Aarav Sharma", room: "Deluxe 412", time: "14:00" },
  { name: "Riya Pun", room: "Executive 207", time: "15:30" },
  { name: "James Cole", room: "Presidential 901", time: "17:00" },
];

export const todayCheckouts = [
  { name: "Manju Khadka", room: "Standard 105", time: "11:00" },
  { name: "Sara Lee", room: "Deluxe 410", time: "12:00" },
];
