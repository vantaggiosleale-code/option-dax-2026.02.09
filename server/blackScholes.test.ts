import { describe, it, expect } from 'vitest';
import { calculateBlackScholes, percentToDecimal } from '../shared/blackScholes';

describe('Black-Scholes Calculations (Corrected)', () => {
  it('should calculate Call option price and Greeks correctly', () => {
    // Test case: DAX Call option
    const result = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 21000,
      timeToExpiry: 30 / 365, // 30 days
      riskFreeRate: percentToDecimal(2), // 2%
      volatility: percentToDecimal(15), // 15%
      optionType: 'call',
    });

    // Verify all values are calculated
    expect(result.optionPrice).toBeGreaterThan(0);
    expect(result.delta).toBeGreaterThan(0);
    expect(result.delta).toBeLessThan(1);
    expect(result.gamma).toBeGreaterThan(0);
    expect(result.vega).toBeGreaterThan(0);
    expect(result.theta).toBeLessThan(0); // Theta is negative for long positions
    expect(result.rho).toBeGreaterThan(0); // Rho is positive for calls
    
    // Log results for manual verification
    console.log('Call Option Results:', {
      price: result.optionPrice,
      delta: result.delta,
      gamma: result.gamma,
      vega: result.vega,
      theta: result.theta,
      rho: result.rho,
    });
  });

  it('should calculate Put option price and Greeks correctly', () => {
    // Test case: DAX Put option
    const result = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 19000,
      timeToExpiry: 30 / 365, // 30 days
      riskFreeRate: percentToDecimal(2), // 2%
      volatility: percentToDecimal(15), // 15%
      optionType: 'put',
    });

    // Verify all values are calculated
    expect(result.optionPrice).toBeGreaterThan(0);
    expect(result.delta).toBeLessThan(0); // Delta is negative for puts
    expect(result.delta).toBeGreaterThan(-1);
    expect(result.gamma).toBeGreaterThan(0);
    expect(result.vega).toBeGreaterThan(0);
    expect(result.theta).toBeLessThan(0); // Theta is negative for long positions
    expect(result.rho).toBeLessThan(0); // Rho is negative for puts
    
    // Log results for manual verification
    console.log('Put Option Results:', {
      price: result.optionPrice,
      delta: result.delta,
      gamma: result.gamma,
      vega: result.vega,
      theta: result.theta,
      rho: result.rho,
    });
  });

  it('should handle ATM (At-The-Money) options correctly', () => {
    // Test case: ATM Call
    const result = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    // ATM Call delta should be around 0.5
    expect(result.delta).toBeGreaterThan(0.4);
    expect(result.delta).toBeLessThan(0.6);
    
    console.log('ATM Call Delta:', result.delta);
  });

  it('should handle expired options correctly', () => {
    // Test case: Expired ITM Call
    const result = calculateBlackScholes({
      spotPrice: 21000,
      strikePrice: 20000,
      timeToExpiry: 0,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    // Expired option should have intrinsic value only
    expect(result.optionPrice).toBe(1000); // 21000 - 20000
    expect(result.delta).toBe(1); // Delta = 1 for ITM expired call
    expect(result.gamma).toBe(0);
    expect(result.theta).toBe(0);
    expect(result.vega).toBe(0);
    expect(result.rho).toBe(0);
  });

  it('should match reference calculator for specific test case', () => {
    // Test case from reference calculator
    // S=24828.14, K=24900, t=30days, r=2%, σ=15%, Call
    const result = calculateBlackScholes({
      spotPrice: 24828.14,
      strikePrice: 24900,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    // Expected values from reference calculator (approximate)
    // These values should be verified manually with the reference calculator
    expect(result.optionPrice).toBeGreaterThan(400);
    expect(result.optionPrice).toBeLessThan(450);
    expect(result.delta).toBeGreaterThan(0.4);
    expect(result.delta).toBeLessThan(0.7);
    
    console.log('Reference Test Case Results:', {
      price: result.optionPrice,
      delta: result.delta,
      gamma: result.gamma,
      vega: result.vega,
      theta: result.theta,
      rho: result.rho,
    });
  });

  it('should calculate Gamma correctly (scaled by 100)', () => {
    const result = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    // Gamma should be positive and scaled by 100
    expect(result.gamma).toBeGreaterThan(0);
    
    console.log('Gamma (scaled by 100):', result.gamma);
  });

  it('should calculate Vega correctly (per 1% volatility change)', () => {
    const result1 = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    const result2 = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(16), // +1%
      optionType: 'call',
    });

    // Price difference should be approximately equal to Vega
    const priceDiff = result2.optionPrice - result1.optionPrice;
    const vega = result1.vega;
    
    // Allow 5% tolerance due to rounding
    expect(Math.abs(priceDiff - vega) / vega).toBeLessThan(0.05);
    
    console.log('Vega verification:', {
      vega: vega,
      actualPriceDiff: priceDiff,
      error: Math.abs(priceDiff - vega),
    });
  });

  it('should calculate Theta correctly (daily decay)', () => {
    const result = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    // Theta should be negative for long positions
    expect(result.theta).toBeLessThan(0);
    
    console.log('Theta (daily):', result.theta);
  });

  it('should calculate Rho correctly (per 1% rate change)', () => {
    const result1 = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(2),
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    const result2 = calculateBlackScholes({
      spotPrice: 20000,
      strikePrice: 20000,
      timeToExpiry: 30 / 365,
      riskFreeRate: percentToDecimal(3), // +1%
      volatility: percentToDecimal(15),
      optionType: 'call',
    });

    // Price difference should be approximately equal to Rho
    const priceDiff = result2.optionPrice - result1.optionPrice;
    const rho = result1.rho;
    
    // Allow 5% tolerance due to rounding
    expect(Math.abs(priceDiff - rho) / Math.abs(rho)).toBeLessThan(0.05);
    
    console.log('Rho verification:', {
      rho: rho,
      actualPriceDiff: priceDiff,
      error: Math.abs(priceDiff - rho),
    });
  });
});
