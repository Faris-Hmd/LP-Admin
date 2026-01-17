import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to dd/mm/yyyy
export function formatDate(date: any): string {
  if (!date) return "";

  let d: Date;

  // Handle Firebase Timestamp
  if (date && typeof date.toDate === "function") {
    d = date.toDate();
  }
  // Handle string or number
  else if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  }
  // Handle Date object
  else if (date instanceof Date) {
    d = date;
  } else {
    return "";
  }

  // Valid date check
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
