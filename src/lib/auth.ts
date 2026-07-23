import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { tenants } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      tenantId: { type: "string", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [tenant] = await db
            .insert(tenants)
            .values({ name: user.name || user.email })
            .returning();
          if (!tenant) throw new Error("tenant creation failed");
          return { data: { ...user, tenantId: tenant.id } };
        },
      },
    },
  },
});
