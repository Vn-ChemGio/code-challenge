/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_NODE_ENV?: 'production' | 'staging' | 'development';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

type PriceItem = {
  currency: string;
  date: string;
  price: number;
};

type FormValues = {
  fromCoin: string;
  toCoin: string;
  amount: number;
};

type QuoteParams = {
  fromCoin: string;
  toCoin: string;
  amount: number;
};

type QuoteResponse = {
  amount: number;
};