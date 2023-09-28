export function shopifyIdToNumber(shopifyId: string) {
    return parseInt(shopifyId.split("/").at(-1)) ?? null;
}