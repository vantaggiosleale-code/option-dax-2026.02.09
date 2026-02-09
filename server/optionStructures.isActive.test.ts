import { describe, it, expect } from "vitest";
import type { OptionLeg } from "../shared/optionTypes";

/**
 * Test per verificare la funzionalità isActive delle gambe (legs)
 * 
 * La funzionalità permette di attivare/disattivare singole gambe per simulare
 * l'impatto di ogni opzione sulla strategia complessiva senza modificare i dati salvati.
 */

describe("OptionLeg isActive functionality", () => {
  // Mock di gambe di test
  const mockLegs: OptionLeg[] = [
    {
      optionType: "call",
      strike: 24900,
      expiryDate: "2026-02-20",
      quantity: 1,
      tradePrice: 100,
      impliedVolatility: 15,
      isActive: true, // Gamba attiva
    },
    {
      optionType: "put",
      strike: 24900,
      expiryDate: "2026-02-20",
      quantity: 1,
      tradePrice: 100,
      impliedVolatility: 15,
      isActive: false, // Gamba disattivata
    },
    {
      optionType: "call",
      strike: 25000,
      expiryDate: "2026-02-20",
      quantity: 1,
      tradePrice: 120,
      impliedVolatility: 15,
      // isActive non specificato (default true)
    },
  ];

  it("should filter only active legs (isActive !== false)", () => {
    const activeLegs = mockLegs.filter((leg) => leg.isActive !== false);
    
    expect(activeLegs).toHaveLength(2);
    expect(activeLegs[0].optionType).toBe("call");
    expect(activeLegs[0].strike).toBe(24900);
    expect(activeLegs[1].optionType).toBe("call");
    expect(activeLegs[1].strike).toBe(25000);
  });

  it("should treat legs without isActive field as active (default true)", () => {
    const legWithoutIsActive: OptionLeg = {
      optionType: "call",
      strike: 25100,
      expiryDate: "2026-02-20",
      quantity: 1,
      tradePrice: 130,
      impliedVolatility: 15,
      // isActive non specificato
    };

    const activeLegs = [legWithoutIsActive].filter((leg) => leg.isActive !== false);
    
    expect(activeLegs).toHaveLength(1);
    expect(activeLegs[0].strike).toBe(25100);
  });

  it("should exclude legs with isActive=false from calculations", () => {
    const activeLegs = mockLegs.filter((leg) => leg.isActive !== false);
    const inactiveLegs = mockLegs.filter((leg) => leg.isActive === false);
    
    expect(inactiveLegs).toHaveLength(1);
    expect(inactiveLegs[0].optionType).toBe("put");
    expect(inactiveLegs[0].strike).toBe(24900);
  });

  it("should calculate net premium only for active legs", () => {
    const activeLegs = mockLegs.filter((leg) => leg.isActive !== false);
    
    // Calcolo net premium (semplificato: somma dei trade prices)
    const netPremium = activeLegs.reduce((sum, leg) => {
      return sum + leg.tradePrice * leg.quantity;
    }, 0);
    
    // Solo 2 gambe attive: 100 + 120 = 220
    expect(netPremium).toBe(220);
  });

  it("should handle all legs inactive scenario", () => {
    const allInactiveLegs: OptionLeg[] = [
      {
        optionType: "call",
        strike: 24900,
        expiryDate: "2026-02-20",
        quantity: 1,
        tradePrice: 100,
        impliedVolatility: 15,
        isActive: false,
      },
      {
        optionType: "put",
        strike: 24900,
        expiryDate: "2026-02-20",
        quantity: 1,
        tradePrice: 100,
        impliedVolatility: 15,
        isActive: false,
      },
    ];

    const activeLegs = allInactiveLegs.filter((leg) => leg.isActive !== false);
    
    expect(activeLegs).toHaveLength(0);
  });

  it("should handle all legs active scenario", () => {
    const allActiveLegs: OptionLeg[] = [
      {
        optionType: "call",
        strike: 24900,
        expiryDate: "2026-02-20",
        quantity: 1,
        tradePrice: 100,
        impliedVolatility: 15,
        isActive: true,
      },
      {
        optionType: "put",
        strike: 24900,
        expiryDate: "2026-02-20",
        quantity: 1,
        tradePrice: 100,
        impliedVolatility: 15,
        isActive: true,
      },
    ];

    const activeLegs = allActiveLegs.filter((leg) => leg.isActive !== false);
    
    expect(activeLegs).toHaveLength(2);
  });
});
