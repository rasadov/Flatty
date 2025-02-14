import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index === 0 ? (
            <Link 
              href={item.href}
              className="flex items-center text-gray-500 hover:text-gray-900"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 text-gray-500 mx-2" />
              {item.active ? (
                <span className="text-gray-900">{item.label}</span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-gray-500 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
} 