// src/components/layout/AdminMenu.tsx
'use client';

import { Fragment, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface AdminInfo {
  name: string;
  role: string;
  initials: string;
}

export default function AdminMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only render for authenticated admin user
  if (!user?.is_superuser) {
    return null;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) {
        return;
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Get admin info from environment variables with fallbacks
  const adminInfo: AdminInfo = {
    name: process.env.NEXT_PUBLIC_ADMIN_NAME || '{{ADMIN_NAME}}',
    role: process.env.NEXT_PUBLIC_ADMIN_ROLE || 'Administrator',
    initials: process.env.NEXT_PUBLIC_ADMIN_INITIALS || '{{ADMIN_INITIALS}}'
  };

  const dropdownContent = isOpen && mounted ? (
    <div
      ref={dropdownRef}
      className="fixed right-4 top-16 w-48 sm:w-56 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 py-1 animate-in slide-in-from-top-2"
      style={{
        zIndex: 2147483647,
        position: 'fixed',
        isolation: 'isolate'
      }}
    >
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
        <p className="text-xs font-medium text-gray-500">{adminInfo.role}</p>
      </div>
      
      <div className="border-t border-gray-200">
        <Link
          href="/dashboard"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setIsOpen(false)}
        >
          Dashboard
        </Link>
        <button
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          Sign out
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="relative ml-1 sm:ml-2 md:ml-3">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="sr-only">Open admin menu</span>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden ring-2 ring-blue-500">
            <Image
              src="/images/profile.jpg"
              alt={adminInfo.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
              priority
              unoptimized
            />
          </div>
        </button>
      </div>
      {mounted && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}