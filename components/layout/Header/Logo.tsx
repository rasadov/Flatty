import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" className="block">
      <Image
        src="/images/logo/logo.svg"
        alt="Property Logo"
        width={120}
        height={40}
        priority
      />
    </Link>
  );
};

export default Logo; 