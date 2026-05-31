import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasArabic(value: string | null | undefined): boolean {
  return !!value && /\p{Script=Arabic}/u.test(value)
}
