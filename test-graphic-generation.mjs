import { generateGraphic } from './server/graphics/generator.ts';

// Test data per apertura struttura
const testData = {
  type: 'apertura',
  tag: 'LS76',
  date: '21/01/2026',
  daxSpot: '24,783.12',
  legs: [
    {
      optionType: 'Put',
      strike: '25000',
      quantity: 1,
      tradePrice: '319',
      expiryDate: '20 FEB 26'
    },
    {
      optionType: 'Call',
      strike: '25700',
      quantity: 1,
      tradePrice: '319',
      expiryDate: '20 FEB 26'
    }
  ]
};

console.log('🎨 Test generazione grafica Telegram...');
console.log('Tipo:', testData.type);
console.log('Tag:', testData.tag);
console.log('Gambe:', testData.legs.length);

try {
  const result = await generateGraphic(testData);
  console.log('✅ Grafica generata con successo!');
  console.log('📁 File salvato:', result.filePath);
  console.log('🔗 URL S3:', result.s3Url);
} catch (error) {
  console.error('❌ Errore generazione:', error.message);
  console.error(error.stack);
}
