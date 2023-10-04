import analyze from "../prisma/database/analyze";

export async function saveAnalyzeProduct(shop: string, productId: string, event: string) {
  const type = 'product';
  const analyzeData = await analyze.getAnalyzeData(shop, productId, event, type);

  if (analyzeData) {
    await analyze.updateAnalyzeData({...analyzeData, actionCount: analyzeData.actionCount + 1})
  } else {
    await analyze.createAnalyzeData({shop, event, actionCount: 1, type, itemId: productId});
  }
}

export async function getAnalyzeByProduct(shop: string, productId: string){
  const type = 'product';
  const analyzeData = await analyze.getAnalyzeDataByProduct(shop, productId, type);

  if (analyzeData) {
    return analyzeData;
  } else {
    return [];
  }
}