"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminPasswordGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin/login') return;

    let ignore = false;

    async function checkPasswordRequirement() {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) return;

        const data = await res.json();
        if (!ignore && data.admin?.forcePasswordChange && pathname !== '/admin/settings') {
          router.replace('/admin/settings');
        }
      } catch (error) {
        console.error('Password requirement check failed:', error);
      }
    }

    checkPasswordRequirement();

    return () => {
      ignore = true;
    };
  }, [pathname, router]);

  return null;
}
