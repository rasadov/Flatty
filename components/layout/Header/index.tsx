'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import Logo from './Logo';
import Navigation from './Navigation';
import { useSession, signOut } from 'next-auth/react';
import Button from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CurrencySelector } from '@/components/ui/currency-selector';

const Header = () => {
  const { data: session } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Logo />
              <Navigation />
            </div>

            <div className="flex items-center gap-4">
              <CurrencySelector />
              
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

              <button 
                className="lg:hidden p-2"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          {showMobileMenu && (
            <div className="lg:hidden border-t py-4">
              <Navigation />
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