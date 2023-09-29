import type {AnalyzeDataCreate, AnalyzeDataUpdate} from "../types";
import prisma, { tryCatch } from "./client";

export default {
  getAnalyzeData,
  createAnalyzeData,
  updateAnalyzeData,
};

async function getAnalyzeData(shop: string, itemId: string, event: string, type: string) {
  const { data, error } = await tryCatch(async () => {
    return await prisma.analyzeData.findFirst({
      where: {
        shop,
        itemId,
        event,
        type
      },
    });
  });
  if (!error) return data;
  return undefined;
}

async function createAnalyzeData(data: AnalyzeDataCreate) {
  const { error } = await tryCatch(async () => {
    return await prisma.analyzeData.create({
      data: {
        ...data,
      },
    });
  });
  if (error) return false;
  return true;
}

async function updateAnalyzeData(data: AnalyzeDataUpdate) {
  const { data: analyzeData, error } = await tryCatch(async () => {
    return await prisma.analyzeData.update({
      where: {
        id: data.id
      },
      data,
    });
  });
  if (!error) return analyzeData;
  return undefined;
}
