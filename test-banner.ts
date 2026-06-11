import { BannerRepository } from "./src/repositories/banner.repository";

async function run() {
  try {
    const banner = await BannerRepository.getBannerById("ffe458ad-f318-494b-894d-601b275c4e43");
    console.log("Banner found:", banner);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
