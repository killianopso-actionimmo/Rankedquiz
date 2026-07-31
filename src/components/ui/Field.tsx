"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/* Base partagee par input / select : meme hauteur, meme rayon, meme focus. */
const CONTROL = cn(
  "h-12 w-full rounded-sm border bg-background-card px-token-4 text-base text-ink",
  "border-line placeholder:text-ink-faint",
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-token",
  "hover:border-vanilla-dark",
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-sunken",
);

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-token-2 block text-sm font-semibold text-ink">
      {children}
      {hint && <span className="ml-token-2 font-regular text-ink-soft">{hint}</span>}
    </label>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <>
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        className={cn(CONTROL, error && "border-danger focus:border-danger focus:ring-danger", className)}
      />
      {error && <p className="mt-token-1 text-sm font-semibold text-danger">{error}</p>}
    </>
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(CONTROL, "cursor-pointer pr-token-8", className)}>
      {children}
    </select>
  );
}

/** Checkbox + radio : meme accent cyan, meme focus. */
export function Choice({
  type = "checkbox",
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-token-2 text-base text-ink",
        props.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        {...props}
        type={type}
        className={cn(
          "h-5 w-5 cursor-pointer border-2 border-line bg-background-card",
          "accent-[rgb(var(--c-cyan))]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-[rgb(var(--c-cyan))]",
          type === "radio" ? "rounded-full" : "rounded-[4px]",
        )}
      />
      {label}
    </label>
  );
}
