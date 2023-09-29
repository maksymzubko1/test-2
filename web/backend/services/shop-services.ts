import shops from "../prisma/database/shops";
import {ShopUpdate} from "../prisma/types";

export async function getShop(shop: string) {
  const shopInfo = await shops.getShop(shop);

  if (shopInfo) {
    return shopInfo;
  } else {
    throw new Error(`Error while fetching shopInfo for shop ${shop}`);
  }
}

export async function updateShop(shopData: ShopUpdate) {
  const shopInfo = await shops.updateShop(shopData);

  if (shopInfo) {
    return shopInfo;
  } else {
    throw new Error(`Error while fetching shopInfo for shop ${shopData.shop}`);
  }
}

