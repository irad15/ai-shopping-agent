import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes.
 * 
 * - 'clsx' handles conditional class logic (e.g., active ? 'bg-blue' : 'bg-red').
 * - 'twMerge' ensures that later classes take priority and resolves Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
