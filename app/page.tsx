import Hero from '@/components/sections/Hero';
import BestOffers from '@/components/sections/BestOffers';
import Partners from '@/components/sections/Partners';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import { FeaturedProperties } from '@/components/sections/FeaturedProperties';
import FeaturedComplexes from '@/components/sections/FeaturedComplexes';
// import Testimonials from '@/components/sections/Testimonials';
// import Newsletter from '@/components/sections/Newsletter';
import { getFeaturedProperties } from '@/lib/properties';

export default async function Home() {
  const properties = await getFeaturedProperties();

  return (
    <main className="pt-2 sm:pt-16">
      <Hero />
      <FeaturedProperties initialProperties={properties} />
      <FeaturedComplexes />
      <BestOffers />
      <Partners />
      <WhyChooseUs />
      
      
      {/* <Testimonials />
      
      <Newsletter /> */}
    </main>
  );
} 