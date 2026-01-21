import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('ERROR: DATABASE_URL non impostata');
  process.exit(1);
}

try {
  console.log('Connessione al database...');
  const connection = await mysql.createConnection(dbUrl);
  console.log('✓ Connessione riuscita');
  
  const [rows] = await connection.execute('SELECT 1 as test');
  console.log('✓ Query test riuscita:', rows);
  
  // Test query su tabella structures
  const [structures] = await connection.execute('SELECT COUNT(*) as count FROM structures');
  console.log('✓ Tabella structures accessibile:', structures);
  
  await connection.end();
  console.log('✓ Database funzionante correttamente');
} catch (error) {
  console.log('✗ Errore connessione database:', error.message);
  console.log('Stack:', error.stack);
  process.exit(1);
}
