import {
  Prisma,
  Shop as PrismaShop,
  ShopData,
  Subscription,
} from "@prisma/client";

export type Shop = PrismaShop & {
  subscription: Subscription;
  shopData: ShopData;
};

export type AnalyzeData = {type: string, shop: string, id: number, itemId: string, actionCount: number, event: string, timestamp: Date}
export type AnalyzeDataCreate = {type: string, shop: string, itemId: string, actionCount: number, event: string}
export type AnalyzeDataUpdate = {type: string, shop: string, id: number, itemId: string, actionCount: number, event: string}

export type ShopCreate = Prisma.ShopCreateInput;
export type ShopUpdate = Prisma.ShopUpdateInput;
