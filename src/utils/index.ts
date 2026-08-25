/**
 * Returns a CSS variable value from the document root.
 * Useful for reading design tokens at runtime.
 */
export function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Joins class names, filtering out falsy values.
 * Lightweight alternative to `clsx` for simple cases.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
