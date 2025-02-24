import React from 'react';
import { Home, Shield, Clock, Award } from 'lucide-react';
import Section from '../Section';

const features = [
  {
    icon: Home,
    title: 'Wide Range of Properties',
    description: 'Find your perfect match from our extensive collection of properties'
  },
  {
    icon: Shield,
    title: 'Trusted by Thousands',
    description: 'Join our community of satisfied customers who found their dream homes'
  },
  {
    icon: Clock,
    title: 'Fast & Easy Process',
    description: 'Quick and hassle-free property search and booking process'
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'All properties are verified and meet our high quality standards'
  }
];

const WhyChooseUs = () => {
  return (
    <Section className="my-4 container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Choose Us
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We provide the best service in the industry with multiple benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <feature.icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default WhyChooseUs; 