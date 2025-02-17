'use client';

import React, { useState } from 'react';
import Select from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
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
};

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
}

const FilterBar = ({ onFilterChange, filters }: FilterBarProps) => {
  const { currency, convertPrice } = useCurrency();
  const [showFilters, setShowFilters] = useState(false);
  const [customPriceRange, setCustomPriceRange] = useState([0, 1000000]);

  const handleChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    // Конвертируем цены обратно в базовую валюту (GBP) перед отправкой фильтров
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select 
            label="Category"
            value={filters.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
          >
            {propertyTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select 
            label="Price Range"
            value={filters.priceRange}
            onChange={(e) => handleChange('priceRange', e.target.value)}
          >
            {priceRanges.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select 
            label="Bedrooms"
            value={filters.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
          >
            {bedroomOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select 
            label="Sort By"
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="flex gap-2 items-end">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button 
              type="button" 
              className="flex-1"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-t p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Select label="Area">
              <option value="">All Areas</option>
              <option value="central">Central London</option>
              <option value="north">North London</option>
              <option value="south">South London</option>
              <option value="east">East London</option>
              <option value="west">West London</option>
            </Select>

            <Select label="City">
              <option value="">All Cities</option>
              <option value="london">London</option>
              <option value="manchester">Manchester</option>
              <option value="birmingham">Birmingham</option>
              <option value="liverpool">Liverpool</option>
              <option value="leeds">Leeds</option>
            </Select>

            <Select label="Apartment's Size">
              <option value="">Any Size</option>
              <option value="0-500">0 - 500 sq ft</option>
              <option value="501-1000">501 - 1000 sq ft</option>
              <option value="1001+">1000+ sq ft</option>
            </Select>

            <Select label="Property Status">
              <option value="">Any Status</option>
              <option value="ready">Ready to Move</option>
              <option value="under-construction">Under Construction</option>
              <option value="off-plan">Off Plan</option>
            </Select>

            <Select label="Furnished">
              <option value="">Any</option>
              <option value="furnished">Furnished</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="partial">Partially Furnished</option>
            </Select>

            <Select label="Amenities">
              <option value="">Any</option>
              <option value="parking">Parking</option>
              <option value="gym">Gym</option>
              <option value="pool">Swimming Pool</option>
              <option value="security">24/7 Security</option>
            </Select>

            <Select label="View">
              <option value="">Any View</option>
              <option value="city">City View</option>
              <option value="park">Park View</option>
              <option value="river">River View</option>
              <option value="garden">Garden View</option>
            </Select>

            <Select label="Floor Level">
              <option value="">Any Floor</option>
              <option value="low">Low Floor (1-5)</option>
              <option value="mid">Mid Floor (6-15)</option>
              <option value="high">High Floor (16+)</option>
              <option value="penthouse">Penthouse</option>
            </Select>

            <Select label="Completion">
              <option value="">Any</option>
              <option value="ready">Ready</option>
              <option value="3months">Within 3 Months</option>
              <option value="6months">Within 6 Months</option>
              <option value="1year">Within 1 Year</option>
            </Select>

            <Select label="Building Age">
              <option value="">Any Age</option>
              <option value="new">New Building</option>
              <option value="0-5">0-5 Years</option>
              <option value="5-10">5-10 Years</option>
              <option value="10+">10+ Years</option>
            </Select>

            <Select label="Layout Type">
              <option value="">Any Layout</option>
              <option value="studio">Studio</option>
              <option value="open">Open Plan</option>
              <option value="split">Split Level</option>
              <option value="duplex">Duplex</option>
            </Select>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar; 