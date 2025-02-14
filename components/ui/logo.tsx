import Image from 'next/image';

const Logo = () => {
  return (
    <div className="relative w-[244px] h-[75px]">
      <Image 
        src="/images/logo/logo.svg" 
        alt="Flatty Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo; 