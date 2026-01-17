import { addDoc } from "firebase/firestore";
import { ordersRef } from "@/lib/firebase";

/**
 * Seed script to create test shipped/delivered orders across all months of 2026
 * Run this from a page or API route to populate test data
 */
export async function seedShippedOrders() {
  const customers = [
    {
      email: "ahmed.mohamed@example.com",
      name: "أحمد محمد",
      city: "الخرطوم",
      phone: "+249912345678",
    },
    {
      email: "fatima.ali@example.com",
      name: "فاطمة علي",
      city: "الخرطوم",
      phone: "+249923456789",
    },
    {
      email: "omar.hassan@example.com",
      name: "عمر حسن",
      city: "أم درمان",
      phone: "+249934567890",
    },
    {
      email: "sara.ibrahim@example.com",
      name: "سارة إبراهيم",
      city: "الخرطوم",
      phone: "+249945678901",
    },
    {
      email: "khalid.ahmed@example.com",
      name: "خالد أحمد",
      city: "الخرطوم",
      phone: "+249956789012",
    },
    {
      email: "layla.mustafa@example.com",
      name: "ليلى مصطفى",
      city: "بحري",
      phone: "+249967890123",
    },
    {
      email: "youssef.salah@example.com",
      name: "يوسف صلاح",
      city: "الخرطوم",
      phone: "+249978901234",
    },
    {
      email: "mona.kamal@example.com",
      name: "منى كمال",
      city: "أم درمان",
      phone: "+249989012345",
    },
  ];

  const products = [
    { id: "p1", name: "بيتزا مارجريتا كبيرة", cost: 450, cat: "pizza" },
    { id: "p2", name: "بيتزا بيبروني", cost: 520, cat: "pizza" },
    { id: "p3", name: "بيتزا مشكلة", cost: 580, cat: "pizza" },
    { id: "p4", name: "برجر دجاج", cost: 350, cat: "burgers" },
    { id: "p5", name: "برجر لحم", cost: 400, cat: "burgers" },
    { id: "p6", name: "بطاطس مقلية كبيرة", cost: 120, cat: "sides" },
    { id: "p7", name: "سلطة سيزر", cost: 180, cat: "salads" },
    { id: "p8", name: "كوكاكولا 1.5 لتر", cost: 80, cat: "drinks" },
    { id: "p9", name: "عصير برتقال طازج", cost: 100, cat: "drinks" },
    { id: "p10", name: "وجبة عائلية", cost: 1200, cat: "meals" },
  ];

  const drivers = ["driver123", "driver456", "driver789"];
  const paymentMethods = ["cash", "card"];

  const testOrders = [];

  // Generate orders for each month of 2026
  for (let month = 1; month <= 12; month++) {
    // Generate 3-8 orders per month
    const ordersPerMonth = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < ordersPerMonth; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];

      // Random day in the month
      const daysInMonth = new Date(2026, month, 0).getDate();
      const day = Math.floor(Math.random() * daysInMonth) + 1;

      // Random time during the day
      const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
      const minute = Math.floor(Math.random() * 60);

      const createdDate = new Date(2026, month - 1, day, hour, minute);
      const createdAt = createdDate.getTime();

      // Delivered 30 min to 3 hours after creation
      const deliveryDelay = (Math.floor(Math.random() * 150) + 30) * 60 * 1000;
      const deliveredAt = createdAt + deliveryDelay;

      // Select 1-4 random products
      const numProducts = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      const usedIndices = new Set();

      for (let j = 0; j < numProducts; j++) {
        let productIndex;
        do {
          productIndex = Math.floor(Math.random() * products.length);
        } while (usedIndices.has(productIndex));
        usedIndices.add(productIndex);

        const product = products[productIndex];
        const quantity = Math.floor(Math.random() * 3) + 1;

        selectedProducts.push({
          id: product.id,
          p_name: product.name,
          p_cost: product.cost,
          p_cat: product.cat,
          p_details: `منتج ${product.name}`,
          p_imgs: [{ url: "/placeholder.png" }],
          p_qu: quantity,
        });
      }

      const totalAmount = selectedProducts.reduce(
        (sum, p) => sum + p.p_cost * p.p_qu,
        0,
      );

      testOrders.push({
        customer_email: customer.email,
        customer_name: customer.name,
        shippingInfo: {
          address: `شارع ${Math.floor(Math.random() * 100)}, ${customer.city}`,
          phone: customer.phone,
          city: customer.city,
        },
        productsList: selectedProducts,
        status: "Delivered" as const,
        createdAt,
        deliveredAt,
        totalAmount,
        driverId: drivers[Math.floor(Math.random() * drivers.length)],
        paymentMethod:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        ...(Math.random() > 0.7 && {
          transactionReference: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        }),
      });
    }
  }

  console.log(
    `🌱 Starting to seed ${testOrders.length} shipped orders across all months of 2026...`,
  );

  try {
    const promises = testOrders.map((order) => addDoc(ordersRef, order));
    const results = await Promise.all(promises);

    console.log(`✅ Successfully seeded ${results.length} shipped orders!`);

    // Group by month for summary
    const ordersByMonth: Record<number, number> = {};
    testOrders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth() + 1;
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
    });

    console.log("\n📊 Orders by month:");
    Object.entries(ordersByMonth).forEach(([month, count]) => {
      const monthName = new Date(2026, parseInt(month) - 1).toLocaleString(
        "default",
        { month: "long" },
      );
      console.log(`   ${monthName}: ${count} orders`);
    });

    return {
      success: true,
      count: results.length,
      ids: results.map((doc) => doc.id),
      ordersByMonth,
    };
  } catch (error) {
    console.error("❌ Error seeding orders:", error);
    throw error;
  }
}
