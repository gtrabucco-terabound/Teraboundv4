import { seedGovernance } from './governance-seed';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del monorepo si es necesario
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

async function run() {
  console.log('🚀 Starting Governance Seed Runner...');
  try {
    await seedGovernance();
    console.log('✅ Seed finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

run();
