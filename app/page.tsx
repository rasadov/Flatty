import Hero from '@/components/sections/Hero';
import BestOffers from '@/components/sections/BestOffers';
import Partners from '@/components/sections/Partners';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import FeaturedProperties from '@/components/sections/FeaturedProperties';
// import Testimonials from '@/components/sections/Testimonials';
// import Newsletter from '@/components/sections/Newsletter';

export default function Home() {
  return (
    <main className="pt-16">
      <Hero />
      <FeaturedProperties />
      <BestOffers />
      <Partners />
      <WhyChooseUs />
     
      
      {/* <Testimonials />
      
      <Newsletter /> */}
    </main>
  );
} 