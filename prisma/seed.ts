import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// The first marketing manager (admin) cannot be created from inside the app,
// so we seed it here. Uses upsert so re-running the seed is safe/idempotent.
async function main() {
  const email = "admin@smilelink.ae";
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Admin",
      role: Role.MARKETING_MANAGER,
      isActive: true,
      passwordHash,
    },
    create: {
      email,
      name: "Admin",
      role: Role.MARKETING_MANAGER,
      isActive: true,
      passwordHash,
    },
  });

  console.log(`Seeded marketing manager: ${admin.email} (id: ${admin.id})`);

  // Common social media channels. `icon` is a Simple Icons slug rendered via
  // react-icons/si in the UI (e.g. "instagram" -> SiInstagram).
  const channels = [
    { name: "Instagram", icon: "instagram" },
    { name: "TikTok", icon: "tiktok" },
    { name: "LinkedIn", icon: "linkedin" },
    { name: "Facebook", icon: "facebook" },
    { name: "YouTube", icon: "youtube" },
  ];

  for (const channel of channels) {
    await prisma.channel.upsert({
      where: { name: channel.name },
      update: { icon: channel.icon },
      create: channel,
    });
  }

  console.log(`Seeded ${channels.length} channels`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
