'use client';

import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { motion } from 'framer-motion';

interface SimilarPropertiesProps {
  properties: Property[];
  showDetails?: boolean;
}

export function SimilarProperties({ properties, showDetails = false }: SimilarPropertiesProps) {
  return (
    <div className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Similar Properties
        </h2>
        <p className="mt-4 text-gray-600">
          Based on your preferences, you might also be interested in these properties
        </p>
      </motion.div>

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
    </div>
  );
} 