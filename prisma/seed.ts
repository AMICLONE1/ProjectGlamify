import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding demo tenant…");

  // Clean up any previous seed
  const existing = await db.tenant.findFirst({ where: { slug: "glamour-studio-demo" } });
  if (existing) {
    await db.tenant.delete({ where: { id: existing.id } });
    console.log("Removed previous seed.");
  }

  const passwordHash = await bcrypt.hash("Demo@12345", 12);

  const tenant = await db.tenant.create({
    data: {
      name: "Glamour Studio",
      slug: "glamour-studio-demo",
      businessType: "salon",
      email: "demo@glamify.in",
      phone: "+91 98765 43210",
      gstin: "27ABCDE1234F1Z5",
      plan: "growth",
      locations: {
        create: [
          { name: "Bandra West", city: "Mumbai", address: "14, Hill Road, Bandra West", pincode: "400050", isActive: true },
          { name: "Andheri East", city: "Mumbai", address: "8, MIDC Road, Andheri East", pincode: "400093", isActive: true },
        ],
      },
    },
    include: { locations: true },
  });

  const [branch1, branch2] = tenant.locations;

  // Owner
  const owner = await db.user.create({
    data: {
      tenantId: tenant.id,
      fullName: "Priya Sharma",
      email: "demo@glamify.in",
      phone: "+91 98765 43210",
      role: "owner",
      supabaseUid: passwordHash,
    },
  });

  // Staff members
  const staffData = [
    { fullName: "Ananya Verma", email: "ananya@glamour.demo", speciality: "Hair Colouring", commissionPct: 30, location: branch1 },
    { fullName: "Rahul Nair", email: "rahul@glamour.demo", speciality: "Hair Styling", commissionPct: 28, location: branch1 },
    { fullName: "Sneha Kulkarni", email: "sneha@glamour.demo", speciality: "Skin & Facials", commissionPct: 32, location: branch2 },
    { fullName: "Vikram Patel", email: "vikram@glamour.demo", speciality: "Barbering", commissionPct: 25, location: branch2 },
  ];

  const staffUsers = await Promise.all(
    staffData.map((s) =>
      db.user.create({
        data: {
          tenantId: tenant.id,
          fullName: s.fullName,
          email: s.email,
          role: "staff",
          supabaseUid: passwordHash,
          staffDetail: {
            create: {
              locationId: s.location.id,
              speciality: s.speciality,
              commissionPct: s.commissionPct,
              isBookable: true,
            },
          },
        },
        include: { staffDetail: true },
      })
    )
  );

  // Service categories
  const categories = await Promise.all([
    db.serviceCategory.create({ data: { tenantId: tenant.id, name: "Hair", icon: "scissors", sortOrder: 1 } }),
    db.serviceCategory.create({ data: { tenantId: tenant.id, name: "Skin", icon: "sparkles", sortOrder: 2 } }),
    db.serviceCategory.create({ data: { tenantId: tenant.id, name: "Nails", icon: "hand", sortOrder: 3 } }),
    db.serviceCategory.create({ data: { tenantId: tenant.id, name: "Spa", icon: "flower", sortOrder: 4 } }),
  ]);

  const [hairCat, skinCat, nailCat, spaCat] = categories;

  // Services
  const services = await db.service.createMany({
    data: [
      { tenantId: tenant.id, categoryId: hairCat.id, name: "Haircut & Blowdry", durationMinutes: 60, price: 800, taxPct: 18 },
      { tenantId: tenant.id, categoryId: hairCat.id, name: "Global Colour", durationMinutes: 120, price: 2500, taxPct: 18 },
      { tenantId: tenant.id, categoryId: hairCat.id, name: "Highlights (Balayage)", durationMinutes: 150, price: 4500, taxPct: 18 },
      { tenantId: tenant.id, categoryId: hairCat.id, name: "Keratin Treatment", durationMinutes: 180, price: 5500, taxPct: 18 },
      { tenantId: tenant.id, categoryId: skinCat.id, name: "Classic Facial", durationMinutes: 60, price: 1200, taxPct: 18 },
      { tenantId: tenant.id, categoryId: skinCat.id, name: "Gold Facial", durationMinutes: 75, price: 2200, taxPct: 18 },
      { tenantId: tenant.id, categoryId: skinCat.id, name: "Cleanup", durationMinutes: 30, price: 600, taxPct: 18 },
      { tenantId: tenant.id, categoryId: nailCat.id, name: "Manicure", durationMinutes: 45, price: 500, taxPct: 18 },
      { tenantId: tenant.id, categoryId: nailCat.id, name: "Gel Nails", durationMinutes: 60, price: 900, taxPct: 18 },
      { tenantId: tenant.id, categoryId: spaCat.id, name: "Swedish Massage (60 min)", durationMinutes: 60, price: 1800, taxPct: 18 },
    ],
  });

  const serviceList = await db.service.findMany({ where: { tenantId: tenant.id } });

  // Clients
  const clientsData = [
    { fullName: "Aisha Khan", phone: "+91 90001 11111", email: "aisha@example.com", tags: ["vip", "regular"], totalVisits: 14, totalSpend: 28000, loyaltyPoints: 2800 },
    { fullName: "Deepa Menon", phone: "+91 90002 22222", email: "deepa@example.com", tags: ["regular"], totalVisits: 8, totalSpend: 12000, loyaltyPoints: 1200 },
    { fullName: "Rohan Gupta", phone: "+91 90003 33333", tags: ["new"], totalVisits: 2, totalSpend: 2400, loyaltyPoints: 240 },
    { fullName: "Shalini Reddy", phone: "+91 90004 44444", email: "shalini@example.com", tags: ["vip"], totalVisits: 22, totalSpend: 55000, loyaltyPoints: 5500 },
    { fullName: "Kavya Pillai", phone: "+91 90005 55555", tags: ["at-risk"], totalVisits: 5, totalSpend: 7500, loyaltyPoints: 750 },
    { fullName: "Manish Joshi", phone: "+91 90006 66666", tags: ["new"], totalVisits: 1, totalSpend: 800, loyaltyPoints: 80 },
  ];

  const clients = await Promise.all(
    clientsData.map((c) =>
      db.client.create({ data: { tenantId: tenant.id, ...c, allergies: [] } })
    )
  );

  // Appointments — spread over last 7 days + today + next 3 days
  const now = new Date();
  function daysFromNow(d: number, h: number, m = 0) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    dt.setHours(h, m, 0, 0);
    return dt;
  }

  const apptData = [
    { clientIdx: 0, serviceIdx: 0, staffIdx: 0, delta: -3, hour: 10 },
    { clientIdx: 1, serviceIdx: 1, staffIdx: 0, delta: -3, hour: 13 },
    { clientIdx: 2, serviceIdx: 4, staffIdx: 2, delta: -2, hour: 11 },
    { clientIdx: 3, serviceIdx: 2, staffIdx: 0, delta: -1, hour: 14 },
    { clientIdx: 4, serviceIdx: 6, staffIdx: 2, delta: -1, hour: 16 },
    { clientIdx: 0, serviceIdx: 7, staffIdx: 1, delta: 0, hour: 10 },
    { clientIdx: 1, serviceIdx: 0, staffIdx: 1, delta: 0, hour: 12 },
    { clientIdx: 5, serviceIdx: 3, staffIdx: 0, delta: 0, hour: 14 },
    { clientIdx: 3, serviceIdx: 9, staffIdx: 2, delta: 1, hour: 11 },
    { clientIdx: 2, serviceIdx: 8, staffIdx: 1, delta: 2, hour: 15 },
  ];

  for (const a of apptData) {
    const svc = serviceList[a.serviceIdx];
    const staff = staffUsers[a.staffIdx];
    const client = clients[a.clientIdx];
    const startsAt = daysFromNow(a.delta, a.hour);
    const endsAt = new Date(startsAt.getTime() + svc.durationMinutes * 60_000);
    const isPast = a.delta < 0;

    const apt = await db.appointment.create({
      data: {
        tenantId: tenant.id,
        locationId: branch1.id,
        clientId: client.id,
        staffId: staff.staffDetail!.id,
        startsAt,
        endsAt,
        status: isPast ? "completed" : a.delta === 0 ? "confirmed" : "confirmed",
      },
    });

    await db.appointmentItem.create({
      data: { appointmentId: apt.id, serviceId: svc.id, price: svc.price, durationMinutes: svc.durationMinutes },
    });

    if (isPast) {
      const subtotal = svc.price;
      const cgst = Math.round(subtotal * 0.09);
      const sgst = Math.round(subtotal * 0.09);
      const total = subtotal + cgst + sgst;
      const count = await db.invoice.count({ where: { tenantId: tenant.id } });
      const invoiceNumber = `GLM-${startsAt.getFullYear()}${String(startsAt.getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(4, "0")}`;

      const inv = await db.invoice.create({
        data: {
          tenantId: tenant.id,
          locationId: branch1.id,
          clientId: client.id,
          appointmentId: apt.id,
          invoiceNumber,
          status: "paid",
          subtotal,
          discountAmt: 0,
          taxableAmt: subtotal,
          cgstAmt: cgst,
          sgstAmt: sgst,
          totalAmt: total,
          tipAmt: 0,
          paymentMethod: "cash",
          paidAt: startsAt,
          lineItems: {
            create: [{ serviceId: svc.id, label: svc.name, qty: 1, unitPrice: svc.price, taxPct: 18, lineTotal: total }],
          },
        },
      });

      await db.loyaltyTransaction.create({
        data: {
          clientId: client.id,
          invoiceId: inv.id,
          type: "earn",
          points: Math.round(total / 10),
          note: `Earned on ${invoiceNumber}`,
        },
      });
    }
  }

  // Inventory
  const productData = [
    { name: "Loreal Inoa Hair Colour", sku: "HAIR-COL-001", category: "Hair Colour", unit: "tube", costPrice: 180, sellPrice: 0, stockQty: 24, reorderLevel: 10 },
    { name: "Schwarzkopf Shampoo 1L", sku: "HAIR-SHP-001", category: "Hair Care", unit: "bottle", costPrice: 320, sellPrice: 0, stockQty: 8, reorderLevel: 10 },
    { name: "VLCC Facial Kit (Gold)", sku: "SKIN-FCL-001", category: "Skin Care", unit: "kit", costPrice: 250, sellPrice: 0, stockQty: 15, reorderLevel: 5 },
    { name: "OPI Nail Colour (Assorted)", sku: "NAIL-COL-001", category: "Nails", unit: "bottle", costPrice: 420, sellPrice: 0, stockQty: 3, reorderLevel: 5 },
    { name: "Disposable Neck Strips (100pk)", sku: "MISC-NST-001", category: "Consumables", unit: "pack", costPrice: 80, sellPrice: 0, stockQty: 12, reorderLevel: 5 },
    { name: "Bleach Powder 500g", sku: "HAIR-BLC-001", category: "Hair Colour", unit: "pack", costPrice: 220, sellPrice: 0, stockQty: 2, reorderLevel: 4 },
  ];

  await db.product.createMany({
    data: productData.map((p) => ({ tenantId: tenant.id, ...p, supplier: "Beauty Wholesale India" })),
  });

  console.log("✅ Seed complete.");
  console.log("   Tenant slug: glamour-studio-demo");
  console.log("   Login: demo@glamify.in / Demo@12345");
  console.log(`   Owner ID: ${owner.id}`);
  console.log(`   Tenant ID: ${tenant.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
