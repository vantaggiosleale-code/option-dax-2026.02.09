import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { structures, structureGraphics } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateGraphic,
  formatDaxPrice,
  formatDate,
  calculatePnL,
  calculateDuration,
} from "../graphics/generator";

interface OptionLeg {
  optionType: "Call" | "Put";
  strike: number;
  expiryDate: string;
  tradeDate: string;
  tradePrice: number;
  quantity: number;
  openingCommission: number;
  closingCommission: number;
  closingPrice?: number | null;
  closingDate?: string | null;
}

export const graphicsRouter = router({
  /**
   * Genera una grafica Telegram per una struttura
   */
  generate: protectedProcedure
    .input(
      z.object({
        structureId: z.number(),
        type: z.enum(["apertura", "aggiustamento", "chiusura"]),
        // Per aggiustamento: specificare quali gambe sono state chiuse/aggiunte
        closedLegIndices: z.array(z.number()).optional(),
        addedLegIndices: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Solo admin possono generare grafiche
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo gli amministratori possono generare grafiche",
        });
      }

      // Recupera struttura
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database non disponibile",
        });
      }

      const structure = await db
        .select()
        .from(structures)
        .where(eq(structures.id, input.structureId))
        .limit(1)
        .then((rows: any[]) => rows[0]);

      if (!structure) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Struttura non trovata",
        });
      }

      // Parse legs
      const legs: OptionLeg[] = JSON.parse(structure.legs);

      // Ottieni prezzo DAX corrente (mock per ora, sostituire con API reale)
      const daxSpot = 24703.12;

      let imageUrl: string;

      if (input.type === "apertura") {
        // Genera grafica apertura
        const data = {
          tag: structure.tag,
          date: formatDate(structure.createdAt),
          daxSpot: formatDaxPrice(daxSpot),
          legs: legs.map((leg) => ({
            ...leg,
            expiryDate: formatDate(leg.expiryDate),
          })),
        };

        imageUrl = await generateGraphic("apertura", data);
      } else if (input.type === "aggiustamento") {
        // Genera grafica aggiustamento
        const closedLegs = input.closedLegIndices
          ? input.closedLegIndices.map((i) => legs[i])
          : legs.filter((leg) => leg.closingPrice !== null && leg.closingPrice !== undefined);

        const addedLegs = input.addedLegIndices
          ? input.addedLegIndices.map((i) => legs[i])
          : [];

        // Calcola P&L parziale delle gambe chiuse
        let totalPnlPoints = 0;
        closedLegs.forEach((leg) => {
          if (leg.closingPrice !== null && leg.closingPrice !== undefined) {
            const pnl = (leg.closingPrice - leg.tradePrice) * leg.quantity;
            totalPnlPoints += pnl;
          }
        });

        const pnl = calculatePnL(totalPnlPoints, structure.multiplier);

        const data = {
          tag: structure.tag,
          date: formatDate(new Date()),
          daxSpot: formatDaxPrice(daxSpot),
          closedLegs: closedLegs.map((leg) => ({
            ...leg,
            expiryDate: formatDate(leg.expiryDate),
          })),
          addedLegs: addedLegs.map((leg) => ({
            ...leg,
            expiryDate: formatDate(leg.expiryDate),
          })),
          pnlPoints: pnl.points,
          pnlEuro: pnl.euro,
        };

        imageUrl = await generateGraphic("aggiustamento", data);
      } else {
        // Genera grafica chiusura totale
        // Calcola P&L totale
        let totalPnlPoints = 0;
        legs.forEach((leg) => {
          const closingPrice = leg.closingPrice ?? 0;
          const pnl = (closingPrice - leg.tradePrice) * leg.quantity;
          totalPnlPoints += pnl;
        });

        // Sottrai commissioni
        const totalCommissions = legs.reduce(
          (sum, leg) => sum + leg.openingCommission + leg.closingCommission,
          0
        );
        totalPnlPoints -= totalCommissions / structure.multiplier;

        const pnl = calculatePnL(totalPnlPoints, structure.multiplier);

        const openingDate = structure.createdAt;
        const closingDate = structure.closingDate
          ? new Date(structure.closingDate)
          : new Date();

        const data = {
          tag: structure.tag,
          openingDate: formatDate(openingDate),
          closingDate: formatDate(closingDate),
          duration: calculateDuration(openingDate, closingDate),
          pnlPoints: pnl.points,
          pnlEuro: pnl.euro,
        };

        imageUrl = await generateGraphic("chiusura", data);
      }

      // Salva nel database
      const imageKey = imageUrl.split("/").pop() || "";
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database non disponibile",
        });
      }
      await dbInstance.insert(structureGraphics).values({
        structureId: input.structureId,
        type: input.type,
        imageUrl,
        imageKey,
      });

      return { imageUrl };
    }),

  /**
   * Lista tutte le grafiche generate per una struttura
   */
  list: protectedProcedure
    .input(z.object({ structureId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database non disponibile",
        });
      }
      const graphics = await db
        .select()
        .from(structureGraphics)
        .where(eq(structureGraphics.structureId, input.structureId))
        .orderBy(structureGraphics.createdAt);

      return graphics;
    }),

  /**
   * Elimina una grafica
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Solo admin possono eliminare grafiche
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo gli amministratori possono eliminare grafiche",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database non disponibile",
        });
      }
      await db.delete(structureGraphics).where(eq(structureGraphics.id, input.id));

      return { success: true };
    }),
});
