"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function shouldHideHeaderNav(pathname) {
  if (pathname === '/registration') return true;

  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 2 && segments[0] === 'circles';
}

export default function HeaderNavLinks() {
  const pathname = usePathname() || '';
  if (shouldHideHeaderNav(pathname)) return null;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Link href="/available/circles" className="font-sans" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Browse Circles</Link>
      <Link href="/admin/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Admin Portal</Link>
    </div>
  );
}
