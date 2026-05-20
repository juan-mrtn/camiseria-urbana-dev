import { AdminRepository } from "./src/repositories/admin.repository";
AdminRepository.getUnallocatedStock("P01").then(console.log).catch(console.error);
