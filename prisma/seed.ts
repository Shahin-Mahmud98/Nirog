import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '@prisma/client';
//
// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// const prisma = new PrismaClient({ adapter });


// Top-level categories, each with an optional set of subcategories —
// mirrors a typical Bangladeshi online pharmacy's category tree
// (Medicine, Beauty > Skincare/Haircare/Feminine Care, Healthcare >
// Medical Devices, Baby & Mom Care > Maternal Care, etc.)
const CATEGORY_TREE = [
  {
    name: "Medicine",
    slug: "medicine",
    icon: "pill",
    bannerColor: "#0C5C4C",
    description: "Prescription and over-the-counter medicine from DGDA-licensed manufacturers.",
    children: [
      { name: "Dermatological Preparations", slug: "dermatological-preparations", icon: "flask-conical", description: "Prescription creams, ointments, and topical treatments." },
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    icon: "sparkles",
    bannerColor: "#C97A22",
    description: "Dermatologist-tested skincare, haircare, and personal beauty products.",
    children: [
      { name: "Skincare", slug: "skincare", icon: "droplet", description: "Cleansers, serums, moisturizers, and sun protection." },
      { name: "Haircare", slug: "haircare", icon: "scissors", description: "Shampoo, conditioner, and hair treatments." },
      { name: "Feminine Care", slug: "feminine-care", icon: "flower-2", description: "Feminine hygiene and personal care essentials." },
    ],
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    icon: "heart-pulse",
    bannerColor: "#2A6B8C",
    description: "Home medical devices, surgical supplies, and everyday health monitoring.",
    children: [
      { name: "Medical Devices", slug: "medical-devices", icon: "stethoscope", description: "BP monitors, thermometers, oximeters, and diagnostic tools." },
    ],
  },
  {
    name: "Baby & Mom Care",
    slug: "baby-mom-care",
    icon: "baby",
    bannerColor: "#B15A82",
    description: "Certified infant nutrition, pediatric essentials, and maternal health products.",
    children: [
      { name: "Maternal Care", slug: "maternal-care", icon: "heart", description: "Pre- and post-natal health products for mothers." },
    ],
  },
  { name: "Food & Nutrition", slug: "food-nutrition", icon: "apple", bannerColor: "#5C6B3E", description: "Nutritional shakes, diabetic-friendly food, and dietary additions.", children: [] },
  { name: "Homecare", slug: "homecare", icon: "home", bannerColor: "#6B5C3E", description: "Disinfectants, sanitizers, and household wellness supplies.", children: [] },
  { name: "Pet Care", slug: "pet-care", icon: "paw-print", bannerColor: "#7A5C3E", description: "Everyday care products for cats, dogs, and other pets.", children: [] },
  { name: "Herbal", slug: "herbal", icon: "leaf", bannerColor: "#3E6B4E", description: "Traditional plant-based wellness formulations.", children: [] },
  { name: "Sexual Wellness", slug: "sexual-wellness", icon: "shield", bannerColor: "#8C2A5C", description: "Reproductive health products and contraceptives, discreetly packaged.", children: [] },
  { name: "Supplement", slug: "supplement", icon: "flask-conical", bannerColor: "#5C3E8C", description: "Multivitamins, minerals, proteins, and daily wellness supplements.", children: [] },
  { name: "Veterinary", slug: "veterinary", icon: "dog", bannerColor: "#3E5C8C", description: "Regulated veterinary pharmaceuticals and livestock health products.", children: [] },
  { name: "Homeopathy", slug: "homeopathy", icon: "droplets", bannerColor: "#6B3E5C", description: "Quality-assured homeopathic dilutions and tissue remedies.", children: [] },
];

// Sample products per category slug — 2-3 items each so every
// category and subcategory landing page has something to show.
const PRODUCTS_BY_CATEGORY: Record<
  string,
  { name: string; sub: string; description: string; price: number; mrp: number; stock: number; requiresPrescription?: boolean }[]
> = {
  medicine: [
    { name: "Paracetamol 500mg", sub: "Strip of 10 tablets", description: "Fever and pain relief tablets.", price: 12, mrp: 15, stock: 500 },
    { name: "Omeprazole 20mg", sub: "Strip of 14 capsules", description: "Reduces stomach acid production.", price: 45, mrp: 55, stock: 300, requiresPrescription: true },
    { name: "Cetirizine 10mg", sub: "Strip of 10 tablets", description: "Antihistamine for allergy relief.", price: 20, mrp: 25, stock: 400 },
    { name: "Oral Saline (ORS)", sub: "Pack of 5 sachets", description: "Rehydration salts for dehydration.", price: 30, mrp: 35, stock: 600 },
  ],
  "dermatological-preparations": [
    { name: "Clobetasol Cream", sub: "15g tube", description: "Topical corticosteroid for skin inflammation.", price: 85, mrp: 100, stock: 120, requiresPrescription: true },
    { name: "Fusidic Acid Ointment", sub: "10g tube", description: "Antibiotic ointment for bacterial skin infections.", price: 60, mrp: 70, stock: 150, requiresPrescription: true },
  ],
  beauty: [
    { name: "Rose Water Toner", sub: "200ml, alcohol-free", description: "Refreshing daily facial toner.", price: 180, mrp: 220, stock: 140 },
    { name: "Charcoal Face Mask", sub: "100g, deep cleansing", description: "Detoxifying clay mask for oily skin.", price: 260, mrp: 310, stock: 90 },
  ],
  skincare: [
    { name: "Vitamin C Face Serum", sub: "30ml, brightening", description: "Brightening serum with vitamin C.", price: 590, mrp: 750, stock: 120 },
    { name: "Aloe Vera Gel", sub: "150ml, soothing", description: "Soothing gel for skin care.", price: 220, mrp: 260, stock: 200 },
    { name: "Sunscreen SPF50", sub: "50ml, PA+++", description: "Broad spectrum sun protection.", price: 480, mrp: 560, stock: 150 },
  ],
  haircare: [
    { name: "Anti-Dandruff Shampoo", sub: "200ml", description: "Ketoconazole-based dandruff control shampoo.", price: 240, mrp: 280, stock: 160 },
    { name: "Argan Hair Oil", sub: "100ml", description: "Nourishing oil for dry, frizzy hair.", price: 320, mrp: 380, stock: 110 },
  ],
  "feminine-care": [
    { name: "Sanitary Pads", sub: "Pack of 10, extra long", description: "High-absorbency sanitary pads.", price: 95, mrp: 110, stock: 300 },
    { name: "Intimate Wash", sub: "150ml, pH balanced", description: "Gentle daily intimate hygiene wash.", price: 210, mrp: 250, stock: 130 },
  ],
  healthcare: [
    { name: "Surgical Face Masks", sub: "Box of 50", description: "3-ply disposable surgical masks.", price: 150, mrp: 180, stock: 400 },
    { name: "Nebulizer Machine", sub: "Compressor type", description: "Home nebulizer for respiratory treatment.", price: 2200, mrp: 2600, stock: 35 },
  ],
  "medical-devices": [
    { name: "Digital BP Monitor", sub: "Upper arm, automatic", description: "Automatic blood pressure monitor.", price: 2450, mrp: 2900, stock: 40 },
    { name: "Infrared Thermometer", sub: "No-contact, 1 second read", description: "Fast no-contact thermometer.", price: 1350, mrp: 1600, stock: 60 },
    { name: "Pulse Oximeter", sub: "Finger clip, SpO2 + pulse", description: "Measures blood oxygen and pulse.", price: 990, mrp: 1200, stock: 80 },
  ],
  "baby-mom-care": [
    { name: "Baby Diapers", sub: "Pack of 30, size M", description: "Soft and absorbent diapers.", price: 650, mrp: 720, stock: 100 },
    { name: "Baby Lotion", sub: "200ml, fragrance-free", description: "Gentle lotion for baby skin.", price: 340, mrp: 390, stock: 90 },
    { name: "Infant Formula", sub: "400g tin, stage 1", description: "Nutritionally complete infant formula.", price: 890, mrp: 950, stock: 70 },
  ],
  "maternal-care": [
    { name: "Prenatal Multivitamin", sub: "30 tablets", description: "Daily multivitamin for pregnancy.", price: 380, mrp: 420, stock: 100 },
    { name: "Stretch Mark Cream", sub: "150ml", description: "Moisturizing cream for stretch mark prevention.", price: 420, mrp: 480, stock: 75 },
  ],
  "food-nutrition": [
    { name: "Whey Protein Powder", sub: "1kg, chocolate", description: "Protein supplement for muscle recovery.", price: 3200, mrp: 3600, stock: 45 },
    { name: "Diabetic Nutrition Shake", sub: "400g tin", description: "Low-GI nutritional shake for diabetics.", price: 780, mrp: 850, stock: 60 },
  ],
  homecare: [
    { name: "Surface Disinfectant Spray", sub: "500ml", description: "Kills 99.9% of germs on surfaces.", price: 220, mrp: 260, stock: 180 },
    { name: "Mosquito Repellent Coil", sub: "Pack of 10", description: "Long-lasting mosquito repellent coils.", price: 60, mrp: 70, stock: 250 },
  ],
  "pet-care": [
    { name: "Dog Deworming Tablets", sub: "Pack of 4", description: "Broad-spectrum dewormer for dogs.", price: 180, mrp: 210, stock: 90 },
    { name: "Cat Flea & Tick Spot-On", sub: "3 applications", description: "Topical flea and tick prevention for cats.", price: 450, mrp: 520, stock: 65 },
  ],
  herbal: [
    { name: "Ashwagandha Capsules", sub: "60 capsules", description: "Traditional herbal stress-relief supplement.", price: 480, mrp: 550, stock: 100 },
    { name: "Neem Extract Tablets", sub: "100 tablets", description: "Herbal blood purifier and skin support.", price: 150, mrp: 175, stock: 130 },
  ],
  "sexual-wellness": [
    { name: "Latex Condoms", sub: "Pack of 12, discreet packaging", description: "Standard latex condoms.", price: 250, mrp: 290, stock: 200 },
    { name: "Water-Based Lubricant", sub: "100ml", description: "Gentle, body-safe personal lubricant.", price: 320, mrp: 360, stock: 90 },
  ],
  supplement: [
    { name: "Multivitamin Tablets", sub: "30 count, daily dose", description: "Daily multivitamin supplement.", price: 280, mrp: 330, stock: 250 },
    { name: "Omega-3 Fish Oil", sub: "60 softgels", description: "Supports heart and brain health.", price: 650, mrp: 750, stock: 110 },
    { name: "Vitamin D3 2000IU", sub: "60 tablets", description: "Bone and immune health support.", price: 220, mrp: 260, stock: 180 },
  ],
  veterinary: [
    { name: "Poultry Vitamin Supplement", sub: "100g pack", description: "Vitamin supplement for poultry farming.", price: 140, mrp: 160, stock: 80 },
    { name: "Cattle Dewormer", sub: "100ml bottle", description: "Broad-spectrum dewormer for cattle.", price: 380, mrp: 430, stock: 55 },
  ],
  homeopathy: [
    { name: "Arnica Montana 30C", sub: "30ml dilution", description: "Homeopathic remedy for bruising and trauma.", price: 90, mrp: 105, stock: 120 },
    { name: "Nux Vomica 200", sub: "30ml dilution", description: "Homeopathic remedy for digestive discomfort.", price: 90, mrp: 105, stock: 120 },
  ],
};

async function main() {
  const slugToId: Record<string, string> = {};

  for (const top of CATEGORY_TREE) {
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: {},
      create: {
        name: top.name,
        slug: top.slug,
        icon: top.icon,
        bannerColor: top.bannerColor,
        description: top.description,
      },
    });
    slugToId[top.slug] = parent.id;

    for (const child of top.children) {
      const created = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          icon: child.icon,
          bannerColor: top.bannerColor,
          description: child.description,
          parentId: parent.id,
        },
      });
      slugToId[child.slug] = created.id;
    }
  }

  for (const [categorySlug, products] of Object.entries(PRODUCTS_BY_CATEGORY)) {
    for (const p of products) {
      const slug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: p.name,
          slug,
          sub: p.sub,
          description: p.description,
          price: p.price,
          mrp: p.mrp,
          stock: p.stock,
          requiresPrescription: p.requiresPrescription ?? false,
          categoryId: slugToId[categorySlug],
        },
      });
    }
  }

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@nirog.example" },
    update: {},
    create: { name: "Nirog Admin", email: "admin@nirog.example", passwordHash: adminPassword, role: "ADMIN" },
  });

  const customerPassword = await bcrypt.hash("Customer123!", 10);
  await prisma.user.upsert({
    where: { email: "customer@nirog.example" },
    update: {},
    create: { name: "Test Customer", email: "customer@nirog.example", passwordHash: customerPassword, role: "CUSTOMER" },
  });

  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  console.log(`Seed complete: ${categoryCount} categories, ${productCount} products.`);
  console.log("Admin login: admin@nirog.example / Admin123!");
  console.log("Customer login: customer@nirog.example / Customer123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
