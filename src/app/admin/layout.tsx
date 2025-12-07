import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <nav>
          <ul>
            <li><Link href="/admin">Dashboard</Link></li>
            <li><Link href="/admin/users">Users</Link></li>
            <li><Link href="/admin/products">Products</Link></li>
            <li><Link href="/admin/themes">Themes</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
