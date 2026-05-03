export const getLatestPrices = (availableCoins?: PriceItem[])=>{
  if (!availableCoins) return {};
  
  const map: Record<string, number> = {};
  
  availableCoins.forEach((item) => {
    if (!map[item.currency]) {
      map[item.currency] = item.price;
    }
  });
  
  return map;
}