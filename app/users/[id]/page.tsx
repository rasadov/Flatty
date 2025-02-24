import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface UserPageProps {
  params: {
    id: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      listings: {
        include: {
          images: true,
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
  });

  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Профиль пользователя */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <Image
                  src={user.image || '/images/default-avatar.png'}
                  alt={user.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.name}</h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {user.phone && (
                  <p className="text-gray-500">{user.phone}</p>
                )}
                <div className="mt-2 sm:mt-4 flex items-center gap-4">
                  <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {user.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    Member since {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className='flex mt-4 justify-between gap-4'>
            {user.description && (
              <div className="">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-gray-600">{user.description}</p>
              </div>
            )}

            <div className=" border-t">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold">{user._count.listings}</p>
                  <p className="text-sm text-gray-500">Properties</p>
                </div>
                {/* Можно добавить другую статистику */}
              </div>
            </div>
            </div>
          </div>

          {/* Объекты пользователя */}
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Properties by {user.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.listings.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    ...property,
                    status: property.status as 'for-rent' | 'for-sale',
                    currency: property.currency as 'EUR' | 'USD' | 'GBP',
                    category: property.category as 'apartment' | 'house' | 'villa' | 'land'
                  }}
                />
              ))}
            </div>
            {user.listings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No properties listed yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 