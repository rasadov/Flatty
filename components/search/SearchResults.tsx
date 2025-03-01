'use client';

import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { motion } from 'framer-motion';

interface SearchResultsProps {
  properties: Property[];
  searchParams: Record<string, string>;
  showDetails?: boolean;
}

export function SearchResults({ properties, searchParams, showDetails = false }: SearchResultsProps) {
  return (
    <div className="mb-16">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 hidden">
        <h2 className="text-2xl font-semibold mb-4">Your Search Criteria</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(searchParams).map(([key, value]) => (
            <span
              key={key}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
            >
              {key}: {value}
            </span>
          ))}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No properties found matching your criteria
          </h3>
          <p className="text-gray-600">
            Try adjusting your search parameters or check our similar suggestions below
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PropertyCard property={property} showDetails={showDetails} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 