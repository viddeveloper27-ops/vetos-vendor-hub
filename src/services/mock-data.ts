import { Vendor, Product, Order } from "@/types";

export const mockVendors: Vendor[] = [
  {
    _id: "v1",
    name: "PetCare Supplies",
    phone: "9876543210",
    email: "contact@petcare.com",
    gstNumber: "29ABCDE1234F1Z5",
    address: { street: "12 MG Road", city: "Bangalore", state: "Karnataka", pincode: "560001", country: "India" },
  },
  {
    _id: "v2",
    name: "VetMed Distributors",
    phone: "9876543211",
    email: "info@vetmed.com",
    gstNumber: "27XYZAB5678G2H3",
    address: { street: "45 Park Street", city: "Mumbai", state: "Maharashtra", pincode: "400001", country: "India" },
  },
  {
    _id: "v3",
    name: "Animal Nutrition Co",
    phone: "9876543212",
    email: "sales@animalnutrition.com",
    address: { street: "78 NH Road", city: "Delhi", state: "Delhi", pincode: "110001", country: "India" },
  },
];

export const mockProducts: Product[] = [
  { _id: "p1", name: "Rabies Vaccine (Canine)", category: "vaccine", brand: "Nobivac", vendorId: "v1", description: "Single-dose rabies vaccine for dogs", quantity: 150, unit: "vial", price: 250, createdAt: "2025-01-15" },
  { _id: "p2", name: "Parvo Vaccine", category: "vaccine", brand: "Nobivac", vendorId: "v1", description: "Parvovirus vaccine for puppies", quantity: 80, unit: "vial", price: 320, createdAt: "2025-01-20" },
  { _id: "p3", name: "DHPP Combo Vaccine", category: "vaccine", brand: "Vanguard", vendorId: "v1", quantity: 60, unit: "vial", price: 450, createdAt: "2025-02-01" },
  { _id: "p4", name: "Premium Dog Food - Adult", category: "food", brand: "Royal Canin", vendorId: "v1", description: "Complete nutrition for adult dogs", quantity: 200, unit: "bag", price: 1800, createdAt: "2025-02-10" },
  { _id: "p5", name: "Puppy Starter Food", category: "food", brand: "Pedigree", vendorId: "v1", quantity: 150, unit: "bag", price: 950, createdAt: "2025-02-15" },
  { _id: "p6", name: "Cat Food - Indoor", category: "food", brand: "Whiskas", vendorId: "v1", quantity: 120, unit: "bag", price: 1200, createdAt: "2025-03-01" },
  { _id: "p7", name: "Dog Collar - Medium", category: "accessory", brand: "PetSafe", vendorId: "v1", quantity: 300, unit: "piece", price: 350, createdAt: "2025-03-05" },
  { _id: "p8", name: "Cat Litter Tray", category: "accessory", vendorId: "v1", quantity: 50, unit: "piece", price: 650, createdAt: "2025-03-10" },
  { _id: "p9", name: "Feline Calicivirus Vaccine", category: "vaccine", brand: "Felocell", vendorId: "v2", quantity: 40, unit: "vial", price: 380, createdAt: "2025-01-25" },
  { _id: "p10", name: "Bordetella Vaccine", category: "vaccine", brand: "Bronchi-Shield", vendorId: "v2", quantity: 70, unit: "vial", price: 290, createdAt: "2025-02-05" },
  { _id: "p11", name: "Prescription Diet - Kidney", category: "food", brand: "Hill's", vendorId: "v2", quantity: 90, unit: "bag", price: 2200, createdAt: "2025-02-20" },
  { _id: "p12", name: "Veterinary Stethoscope", category: "accessory", brand: "3M Littmann", vendorId: "v2", quantity: 15, unit: "piece", price: 4500, createdAt: "2025-03-01" },
  { _id: "p13", name: "Pet Carrier - Large", category: "accessory", brand: "Petmate", vendorId: "v2", quantity: 25, unit: "piece", price: 2800, createdAt: "2025-03-08" },
  { _id: "p14", name: "Leptospira Vaccine", category: "vaccine", brand: "Nobivac", vendorId: "v3", quantity: 55, unit: "vial", price: 310, createdAt: "2025-01-30" },
  { _id: "p15", name: "Senior Dog Food", category: "food", brand: "Royal Canin", vendorId: "v3", quantity: 100, unit: "bag", price: 2000, createdAt: "2025-02-25" },
  { _id: "p16", name: "Grooming Kit", category: "accessory", vendorId: "v3", quantity: 40, unit: "piece", price: 1500, createdAt: "2025-03-12" },
];

const statuses = ["PENDING", "ACCEPTED", "REJECTED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const customers = [
  { name: "Happy Paws Clinic", phone: "9111222333", address: "23 Vet Lane, Bangalore" },
  { name: "City Pet Hospital", phone: "9222333444", address: "45 Animal Ave, Mumbai" },
  { name: "Green Valley Vet", phone: "9333444555", address: "67 Farm Road, Delhi" },
  { name: "Sunshine Animal Care", phone: "9444555666", address: "89 Park View, Chennai" },
  { name: "Dr. Sharma's Clinic", phone: "9555666777", address: "12 Health Street, Pune" },
];

function generateOrders(): Order[] {
  const orders: Order[] = [];
  let id = 1;
  for (const vendorId of ["v1", "v2", "v3"]) {
    const vendorProducts = mockProducts.filter(p => p.vendorId === vendorId);
    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      for (let j = 0; j < numItems; j++) {
        const prod = vendorProducts[Math.floor(Math.random() * vendorProducts.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        items.push({ productId: prod._id, name: prod.name, quantity: qty, unit: prod.unit, price: prod.price });
      }
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const dayOffset = Math.floor(Math.random() * 60);
      const created = new Date(2025, 0, 15 + dayOffset);
      orders.push({
        _id: `o${id++}`,
        vendorId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        items,
        totalAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: created.toISOString(),
        updatedAt: created.toISOString(),
      });
    }
  }
  return orders;
}

export const mockOrders: Order[] = generateOrders();
