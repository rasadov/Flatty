'use client';

import React, { useState } from 'react';
import Select from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { useCurrency } from '@/components/ui/currency-selector';
import { Checkbox } from '@/components/ui/checkbox';

// Константы для фильтров комплексов
const complexTypes = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed', label: 'Mixed Use' }
];

const complexStatuses = [
  { value: 'under-construction', label: 'Under Construction' },
  { value: 'completed', label: 'Completed' },
  { value: 'off-plan', label: 'Off Plan' }
];

const locationOptions = [
  { value: 'kyrenia', label: 'Kyrenia' },
  { value: 'famagusta', label: 'Famagusta' },
  { value: 'iskele', label: 'Iskele' },
  { value: 'nicosia', label: 'Nicosia' }
];

interface ComplexFilterBarProps {
  filters: {
    priceRange: [number, number];
    location: string;
    status: string;
    type: string;
    installment: boolean;
    parking: boolean;
    swimmingPool: boolean;
    gym: boolean;
  };
  onFilterChange: (filters: ComplexFilterBarProps['filters']) => void;
}

export function ComplexFilterBar({ filters, onFilterChange }: ComplexFilterBarProps) {
  const { currency, convertPrice } = useCurrency();
  const [showFilters, setShowFilters] = useState(false);
  const [customPriceRange, setCustomPriceRange] = useState(filters.priceRange);

  const handleChange = (key: keyof ComplexFilterBarProps['filters'], value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) * 1000;
    if (!isNaN(numValue)) {
      const newRange: [number, number] = type === 'min'
        ? [numValue, customPriceRange[1]]
        : [customPriceRange[0], numValue];
      
      setCustomPriceRange(newRange);
      handleChange('priceRange', newRange);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Complex Filters</h3>
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
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="">Complex Type</option>
            {complexTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
          >
            <option value="">Location</option>
            {locationOptions.map(location => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">Status</option>
            {complexStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>

          <div className="relative">
           
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Min"
                value={`${currency.symbol}${(convertPrice(customPriceRange[0])/1000).toFixed(0)}k`}
                className="w-full text-sm"
                onFocus={(e) => e.target.select()}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              />
              <Input
                type="text"
                placeholder="Max"
                value={`${currency.symbol}${(convertPrice(customPriceRange[1])/1000).toFixed(0)}k`}
                className="w-full text-sm"
                onFocus={(e) => e.target.select()}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Checkbox
                id="installment"
                checked={filters.installment}
                onChange={(e) => handleChange('installment', e.target.checked)}
                label="Installment Available"
              />
              <Checkbox
                id="parking"
                checked={filters.parking}
                onChange={(e) => handleChange('parking', e.target.checked)}
                label="Parking"
              />
              <Checkbox
                id="swimmingPool"
                checked={filters.swimmingPool}
                onChange={(e) => handleChange('swimmingPool', e.target.checked)}
                label="Swimming Pool"
              />
              <Checkbox
                id="gym"
                checked={filters.gym}
                onChange={(e) => handleChange('gym', e.target.checked)}
                label="Gym"
              />
            </div>
          </div>
        )}

        {showFilters && (
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => onFilterChange(filters)}
              className="w-full md:w-auto"
            >
              Apply Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 