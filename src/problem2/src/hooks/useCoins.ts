import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useAvailableCoins = () => {
  return useSWR<PriceItem[]>(
    "https://interview.switcheo.com/prices.json",
    fetcher
  );
};


async function fetchQuote(
  url: string,
  { arg }: { arg: QuoteParams }
): Promise<number> {
  await new Promise((res) => setTimeout(res, 2000));
  
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error("Failed to fetch prices");
  }
  
  const data: PriceItem[] = await res.json();
  
  // lấy latest price
  const sorted = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const latestPrices: Record<string, number> = {};
  
  sorted.forEach((item) => {
    if (!latestPrices[item.currency]) {
      latestPrices[item.currency] = item.price;
    }
  });
  
  const fromPrice = latestPrices[arg.fromCoin];
  const toPrice = latestPrices[arg.toCoin];
  
  if (!fromPrice || !toPrice) {
    throw new Error("Invalid coin selected");
  }
  
  return (arg.amount * fromPrice) / toPrice;
}

export function useQuote() {
  const { trigger, data, error, isMutating } = useSWRMutation(
    "https://interview.switcheo.com/prices.json",
    fetchQuote
  );
  
  return {
    getQuote: trigger,
    quote: data,
    loading: isMutating,
    error,
  };
}