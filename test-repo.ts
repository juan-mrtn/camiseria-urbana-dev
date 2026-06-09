import { ProductoRepository } from "./src/repositories/producto.repository";
async function run() {
  const result = await ProductoRepository.getById("P-595053D4");
  console.log(JSON.stringify(result, null, 2));
}
run();
