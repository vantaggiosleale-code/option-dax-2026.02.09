import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const marketDataRouter = router({
  getDaxPrice: publicProcedure.query(async () => {
    try {
      // Yahoo Finance API per DAX (^GDAXI)
      const symbol = "^GDAXI";
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch DAX price from Yahoo Finance",
        });
      }

      const data = await response.json();
      const result = data.chart.result[0];
      const currentPrice = result.meta.regularMarketPrice;

      if (!currentPrice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "DAX price not available",
        });
      }

      return {
        price: currentPrice,
        timestamp: Date.now(),
        symbol: "^GDAXI",
      };
    } catch (error) {
      console.error("Error fetching DAX price:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch DAX price",
      });
    }
  }),
});
