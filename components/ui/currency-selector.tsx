'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Select from './select';

type Currency = {
  code: string;
  symbol: string;
  rate: number; // Курс относительно базовой валюты (GBP)
};

const currencies: Currency[] = [
  { code: 'GBP', symbol: '£', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 1.17 },
  { code: 'USD', symbol: '$', rate: 1.27 },
  { code: 'RUB', symbol: '₽', rate: 116.5 },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState(currencies[0]);
  const [rates, setRates] = useState<Record<string, number>>({});

  // Fetch актуальных курсов валют
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/GBP`
        );
        const data = await response.json();
        setRates(data.rates);
      } catch (error) {
        console.error('Failed to fetch currency rates:', error);
      }
    };

    fetchRates();
    // Обновляем курсы каждый час
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    const convertedPrice = price * currency.rate;
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(convertedPrice);
  };

  const convertPrice = (price: number) => {
    return price * currency.rate;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select
      value={currency.code}
      onChange={(e) => {
        const newCurrency = currencies.find(c => c.code === e.target.value);
        if (newCurrency) {
          setCurrency(newCurrency);
        }
      }}
      className="w-24"
    >
      {currencies.map((curr) => (
        <option key={curr.code} value={curr.code}>
          {curr.code} {curr.symbol}
        </option>
      ))}
    </Select>
  );
}; 