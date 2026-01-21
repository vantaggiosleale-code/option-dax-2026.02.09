import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { storagePut } from '../storage';

// Registra helper Handlebars
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('gt', (a, b) => a > b);
Handlebars.registerHelper('lt', (a, b) => a < b);

interface Leg {
  optionType: 'Call' | 'Put';
  strike: number;
  expiryDate: string;
  quantity: number;
  tradePrice: number;
  closingPrice?: number | null;
}

interface AperturaData {
  tag: string;
  date: string;
  daxSpot: string;
  legs: Leg[];
}

interface AggiustamentoData {
  tag: string;
  date: string;
  daxSpot: string;
  closedLegs: Leg[];
  addedLegs: Leg[];
  pnlPoints: string;
  pnlEuro: string;
}

interface ChiusuraData {
  tag: string;
  openingDate: string;
  closingDate: string;
  duration: number;
  pnlPoints: string;
  pnlEuro: string;
}

type GraphicType = 'apertura' | 'aggiustamento' | 'chiusura';
type GraphicData = AperturaData | AggiustamentoData | ChiusuraData;

/**
 * Genera una grafica Telegram per una struttura opzioni
 * @param type Tipo di grafica (apertura, aggiustamento, chiusura)
 * @param data Dati della struttura
 * @returns URL pubblico dell'immagine generata su S3
 */
export async function generateGraphic(
  type: GraphicType,
  data: GraphicData
): Promise<string> {
  // 1. Carica template HTML
  const templatePath = join(__dirname, 'templates', `${type}.html`);
  const templateSource = readFileSync(templatePath, 'utf-8');
  
  // 2. Compila template con Handlebars
  const template = Handlebars.compile(templateSource);
  const html = template(data);

  // 3. Genera PNG con Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 800, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    // 4. Upload su S3
    const timestamp = Date.now();
    const key = `graphics/${type}-${timestamp}.png`;
    const { url } = await storagePut(key, screenshot, 'image/png');

    return url;
  } finally {
    await browser.close();
  }
}

/**
 * Formatta un numero come prezzo DAX con separatore migliaia
 */
export function formatDaxPrice(price: number): string {
  return price.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatta una data in formato italiano (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calcola P&L in punti e euro
 */
export function calculatePnL(points: number, multiplier: number = 5): {
  points: string;
  euro: string;
} {
  const sign = points >= 0 ? '+' : '';
  const euros = points * multiplier;
  
  return {
    points: `${sign}${points.toFixed(2)}`,
    euro: `${sign}${euros.toFixed(2)}`,
  };
}

/**
 * Calcola durata in giorni tra due date
 */
export function calculateDuration(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
