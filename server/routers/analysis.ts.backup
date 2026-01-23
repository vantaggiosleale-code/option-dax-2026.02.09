import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

/**
 * Black-Scholes calculation helper
 * Formula for European options pricing
 */
function calculateBlackScholes(params: {
  spotPrice: number;
  strikePrice: number;
  timeToExpiry: number; // in years
  riskFreeRate: number; // as decimal (e.g., 0.05 for 5%)
  volatility: number; // as decimal (e.g., 0.20 for 20%)
  optionType: "call" | "put";
}) {
  const { spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType } = params;

  // Standard normal cumulative distribution function
  const normalCDF = (x: number): number => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  };

  const d1 =
    (Math.log(spotPrice / strikePrice) +
      (riskFreeRate + (volatility * volatility) / 2) * timeToExpiry) /
    (volatility * Math.sqrt(timeToExpiry));

  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

  let optionPrice: number;
  let delta: number;
  let gamma: number;
  let vega: number;
  let theta: number;
  let rho: number;

  if (optionType === "call") {
    optionPrice =
      spotPrice * normalCDF(d1) -
      strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
    delta = normalCDF(d1);
    rho =
      strikePrice *
      timeToExpiry *
      Math.exp(-riskFreeRate * timeToExpiry) *
      normalCDF(d2) /
      100;
  } else {
    optionPrice =
      strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) -
      spotPrice * normalCDF(-d1);
    delta = normalCDF(d1) - 1;
    rho =
      -strikePrice *
      timeToExpiry *
      Math.exp(-riskFreeRate * timeToExpiry) *
      normalCDF(-d2) /
      100;
  }

  // Greeks (same for call and put)
  gamma =
    (Math.exp(-(d1 * d1) / 2) / Math.sqrt(2 * Math.PI)) /
    (spotPrice * volatility * Math.sqrt(timeToExpiry));

  vega =
    (spotPrice *
      Math.sqrt(timeToExpiry) *
      Math.exp(-(d1 * d1) / 2)) /
    Math.sqrt(2 * Math.PI) /
    100;

  theta =
    ((-spotPrice *
      Math.exp(-(d1 * d1) / 2) *
      volatility) /
      (2 * Math.sqrt(2 * Math.PI * timeToExpiry)) -
      riskFreeRate *
        strikePrice *
        Math.exp(-riskFreeRate * timeToExpiry) *
        (optionType === "call" ? normalCDF(d2) : normalCDF(-d2))) /
    365;

  return {
    optionPrice: Math.round(optionPrice * 100) / 100,
    delta: Math.round(delta * 10000) / 10000,
    gamma: Math.round(gamma * 10000) / 10000,
    vega: Math.round(vega * 100) / 100,
    theta: Math.round(theta * 100) / 100,
    rho: Math.round(rho * 100) / 100,
  };
}

export const analysisRouter = router({
  calculateBlackScholes: protectedProcedure
    .input(
      z.object({
        spotPrice: z.number().positive(),
        strikePrice: z.number().positive(),
        timeToExpiry: z.number().positive(), // in years
        riskFreeRate: z.number(), // as decimal
        volatility: z.number().positive(), // as decimal
        optionType: z.enum(["call", "put"]),
        strategyId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { strategyId, ...params } = input;

      const results = calculateBlackScholes(params);

      // Save to analysis history
      await db.saveAnalysis({
        userId: ctx.user.id,
        strategyId: strategyId || null,
        analysisType: "black-scholes",
        inputParams: JSON.stringify(params),
        results: JSON.stringify(results),
      });

      return results;
    }),

  calculatePayoff: protectedProcedure
    .input(
      z.object({
        strategyType: z.enum(["call", "put", "spread", "straddle"]),
        strikePrice: z.number().positive(),
        premium: z.number().positive(),
        quantity: z.number().int().positive(),
        spotPriceRange: z.object({
          min: z.number().positive(),
          max: z.number().positive(),
          step: z.number().positive(),
        }),
        strategyId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { strategyId, spotPriceRange, ...params } = input;

      const payoffData = [];
      for (
        let spotPrice = spotPriceRange.min;
        spotPrice <= spotPriceRange.max;
        spotPrice += spotPriceRange.step
      ) {
        let payoff = 0;

        if (params.strategyType === "call") {
          payoff =
            Math.max(0, spotPrice - params.strikePrice) * params.quantity -
            params.premium * params.quantity;
        } else if (params.strategyType === "put") {
          payoff =
            Math.max(0, params.strikePrice - spotPrice) * params.quantity -
            params.premium * params.quantity;
        }

        payoffData.push({
          spotPrice: Math.round(spotPrice * 100) / 100,
          payoff: Math.round(payoff * 100) / 100,
        });
      }

      const results = {
        payoffData,
        maxProfit: Math.max(...payoffData.map((d) => d.payoff)),
        maxLoss: Math.min(...payoffData.map((d) => d.payoff)),
        breakEvenPoints: payoffData
          .filter((d, i, arr) => {
            if (i === 0) return false;
            return (
              (d.payoff >= 0 && arr[i - 1].payoff < 0) ||
              (d.payoff <= 0 && arr[i - 1].payoff > 0)
            );
          })
          .map((d) => d.spotPrice),
      };

      // Save to analysis history
      await db.saveAnalysis({
        userId: ctx.user.id,
        strategyId: strategyId || null,
        analysisType: "payoff",
        inputParams: JSON.stringify({ ...params, spotPriceRange }),
        results: JSON.stringify(results),
      });

      return results;
    }),

  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().int().positive().default(50) }))
    .query(async ({ input, ctx }) => {
      return await db.getUserAnalysisHistory(ctx.user.id, input.limit);
    }),
});
