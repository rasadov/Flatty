import React from 'react';
import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="hidden lg:flex items-center gap-6">
      <Link href="/properties" className="text-gray-600 hover:text-primary">
        Properties
      </Link>
      <Link href="/agents" className="text-gray-600 hover:text-primary">
        Agents
      </Link>
      <Link href="/about" className="text-gray-600 hover:text-primary">
        About
      </Link>
      <Link href="/contact" className="text-gray-600 hover:text-primary">
        Contact
      </Link>
    </nav>
  );
};

export default Navigation; 