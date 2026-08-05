import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { seedDemo } = await import("../src/lib/seed-demo");
  await seedDemo();
  console.log("Demo tenant seeded.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
