import { pingDatabase } from '../Repository/healthRepository.ts'

export async function checkHealthService() {
  await pingDatabase();
}
