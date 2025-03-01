'use client';

import React, { useState } from 'react';
import Select from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { 
  propertyTypes, 
  priceRanges, 
  bedroomOptions, 
  sortOptions
} from '@/constants/properties';
import { useCurrency } from '@/components/ui/currency-selector';

export type FilterOptions = {
  priceRange: string;
  propertyType: string;
  bedrooms: string;
  sortBy: string;
  detailedCards?: boolean;
};

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const { currency, convertPrice } = useCurrency();
  const [showFilters, setShowFilters] = useState(false);
  const [customPriceRange, setCustomPriceRange] = useState([0, 1000000]);

  const handleChange = (key: keyof FilterOptions, value: string | boolean) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    // Конвертируем цены обратно в базовую валюту (EUR) перед отправкой фильтров
    const baseMin = min / currency.rate;
    const baseMax = max / currency.rate;
    setCustomPriceRange([baseMin, baseMax]);
    
    onFilterChange({
      ...filters,
      priceRange: `${baseMin}-${baseMax}`
    });
  };

  const handleSearch = () => {
    // Применяем все фильтры
    onFilterChange({
      ...filters,
      priceRange: `${customPriceRange[0]}-${customPriceRange[1]}`
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-full transition-colors duration-200" 
              onClick={() => handleChange('detailedCards', !filters.detailedCards)}
            >
              <label htmlFor="detailedCards" className="text-sm font-medium text-gray-600 cursor-pointer">
                Detailed Cards
              </label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="detailedCards" 
                  name="detailedCards" 
                  className="sr-only"
                  checked={!!filters.detailedCards}
                  onChange={() => handleChange('detailedCards', !filters.detailedCards)}
                />
                <div className={`block h-6 rounded-full transition-colors duration-200 ease-in-out ${filters.detailedCards ? 'bg-primary' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${filters.detailedCards ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className={`grid gap-4 ${showFilters ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
          <Select
            value={filters.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
          >
            <option value="">Property Type</option>
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.priceRange}
            onChange={(e) => handleChange('priceRange', e.target.value)}
          >
            <option value="">Price Range</option>
            {priceRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
          >
            <option value="">Bedrooms</option>
            {bedroomOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
          >
            <option value="">Sort By</option>
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Price Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Min"
                  value={`${currency.symbol}${(convertPrice(customPriceRange[0])/1000).toFixed(0)}k`}
                  className="w-full text-sm"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) * 1000;
                    if (!isNaN(value)) {
                      handlePriceRangeChange(value, customPriceRange[1]);
                    }
                  }}
                />
                <Input
                  type="text"
                  placeholder="Max"
                  value={`${currency.symbol}${(convertPrice(customPriceRange[1])/1000).toFixed(0)}k`}
                  className="w-full text-sm"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) * 1000;
                    if (!isNaN(value)) {
                      handlePriceRangeChange(customPriceRange[0], value);
                    }
                  }}
                />
              </div>
            </div>

            <Select label="Property Status">
              <option value="">Any Status</option>
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
            </Select>

            <Select label="Property Category">
              <option value="">Any Category</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
            </Select>

            <Select label="Layout Type">
              <option value="">Any Layout</option>
              <option value="studio">Studio</option>
              <option value="open">Open Plan</option>
              <option value="split">Split Level</option>
              <option value="duplex">Duplex</option>
            </Select>
          </div>
        )}

        {showFilters && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch}>
              Apply Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 