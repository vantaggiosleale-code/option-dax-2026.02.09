import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const userSettingsRouter = router({
  /**
   * Get user settings (default parameters for new structures)
   * Creates default settings if they don't exist
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Try to find existing settings
    let settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)
      .then((rows) => rows[0]);

    // If no settings exist, create default ones
    if (!settings) {
      await db.insert(userSettings).values({
        userId,
        defaultVolatility: "0.15", // 15%
        defaultRiskFreeRate: "0.02", // 2%
        defaultMultiplier: 5,
      });

      // Fetch the newly created settings
      settings = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1)
        .then((rows) => rows[0]);
    }

    return settings;
  }),

  /**
   * Update user settings
   */
  update: protectedProcedure
    .input(
      z.object({
        defaultVolatility: z.string().optional(),
        defaultRiskFreeRate: z.string().optional(),
        defaultMultiplier: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if settings exist
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existing) {
        // Create new settings
        await db.insert(userSettings).values({
          userId,
          defaultVolatility: input.defaultVolatility || "0.15",
          defaultRiskFreeRate: input.defaultRiskFreeRate || "0.02",
          defaultMultiplier: input.defaultMultiplier || 5,
        });
      } else {
        // Update existing settings
        const updateData: any = {};
        if (input.defaultVolatility !== undefined)
          updateData.defaultVolatility = input.defaultVolatility;
        if (input.defaultRiskFreeRate !== undefined)
          updateData.defaultRiskFreeRate = input.defaultRiskFreeRate;
        if (input.defaultMultiplier !== undefined)
          updateData.defaultMultiplier = input.defaultMultiplier;

        if (Object.keys(updateData).length > 0) {
          await db
            .update(userSettings)
            .set(updateData)
            .where(eq(userSettings.userId, userId));
        }
      }

      // Return updated settings
      return await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1)
        .then((rows) => rows[0]);
    }),
});
