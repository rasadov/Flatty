'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, UserCircle, LogOut } from 'lucide-react';
import Logo from './Logo';
import Navigation from './Navigation';
import { useSession, signOut } from 'next-auth/react';
import Button from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { data: session } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Закрываем мобильное меню при переходе на другую страницу
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Logo />
              <div className="hidden sm:block">
                <Navigation />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <CurrencySelector />
              </div>
              
              <div className="hidden sm:flex items-center gap-2">
                {session?.user ? (
                  <>
                    <Link href="/protected/profile">
                      <Button variant="ghost" className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5" />
                        {session.user.name || 'Profile'}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogoutClick}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button>Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>

              <button 
                className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          {showMobileMenu && (
            <div className="sm:hidden border-t py-4 space-y-4">
              <Navigation />
              <div className="px-4 space-y-2">
                {session?.user ? (
                  <div className="space-y-2">
                    <Link href="/protected/profile" className="w-full">
                      <Button variant="ghost" className="w-full flex items-center gap-2 justify-center">
                        <UserCircle className="w-5 h-5" />
                        {session.user.name || 'Profile'}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/signin" className="block">
                      <Button variant="ghost" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/register" className="block">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </>
  );
};

export default Header; 