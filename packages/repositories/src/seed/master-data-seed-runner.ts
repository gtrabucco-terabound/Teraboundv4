import { seedMasterData } from './master-data-seed';

async function run() {
  try {
    await seedMasterData();
    console.log('Seed exitoso.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
}

run();
