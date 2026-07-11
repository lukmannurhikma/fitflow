import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function timeAgo(d: string | Date): string {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s} detik lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day} hari lalu`;
  return formatDate(d);
}

export function avatarColor(name: string): string {
  const colors = [
    '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c',
    '#d97706', '#65a30d', '#059669', '#0891b2', '#4f46e5',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h + name.charCodeAt(i) * 31) % colors.length;
  }
  return colors[h];
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function calcEndDate(start: string, type: string): string {
  const d = new Date(start);
  const months: Record<string, number> = { Platinum: 12, Gold: 6, Silver: 3 };
  d.setMonth(d.getMonth() + (months[type] || 3));
  return d.toISOString().split('T')[0];
}

export function getMemberPrice(type: string): number {
  const prices: Record<string, number> = { Platinum: 2500000, Gold: 1500000, Silver: 900000 };
  return prices[type] || 0;
}

export function getDaysRemaining(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
