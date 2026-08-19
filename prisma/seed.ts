import { db } from "../src/lib/db";
import { hash } from "bcrypt-ts";
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_OPERATIONAL_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_PACKAGES,
  INITIAL_ADDONS,
} from "../src/lib/mock-data";

async function main() {
  console.log("🌱 Memulai seeding database Ciyeng Mamim...");

  // 1. Seed Admin User
  const defaultAdminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@ciyengmamim.com";
  const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin_ciyeng_mamim_2026!";
  const hashedPassword = await hash(defaultAdminPassword, 10);

  await db.adminUser.upsert({
    where: { email: defaultAdminEmail },
    update: { password: hashedPassword },
    create: {
      email: defaultAdminEmail,
      name: "Admin Ciyeng Mamim",
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin user seeded: ${defaultAdminEmail}`);

  // 2. Seed Store Settings
  await db.storeSettings.upsert({
    where: { id: "default_store" },
    update: INITIAL_STORE_SETTINGS,
    create: INITIAL_STORE_SETTINGS,
  });

  // 3. Seed Operational Settings
  await db.operationalSettings.upsert({
    where: { id: "default_operational" },
    update: INITIAL_OPERATIONAL_SETTINGS,
    create: INITIAL_OPERATIONAL_SETTINGS,
  });

  // 4. Seed Payment Settings
  await db.paymentSettings.upsert({
    where: { id: "default_payment" },
    update: INITIAL_PAYMENT_SETTINGS,
    create: INITIAL_PAYMENT_SETTINGS,
  });

  // 5. Seed Products & Variants
  for (const prod of INITIAL_PRODUCTS) {
    const { variants, ...prodData } = prod;
    await db.product.upsert({
      where: { slug: prod.slug },
      update: prodData,
      create: {
        ...prodData,
        variants: {
          create: variants?.map((v) => ({ name: v.name, price: v.price })),
        },
      },
    });
  }

  // 6. Seed Packages
  for (const pkg of INITIAL_PACKAGES) {
    await db.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg,
    });
  }

  // 7. Seed Addons
  for (const addon of INITIAL_ADDONS) {
    await db.addOn.upsert({
      where: { id: addon.id },
      update: addon,
      create: addon,
    });
  }

  console.log("✨ Seeding database selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
