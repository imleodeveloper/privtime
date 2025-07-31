import { InputHTMLAttributes } from "react";

type InputProps = {
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full bg-white px-2 py-1 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${className}`}
    />
  );
}
