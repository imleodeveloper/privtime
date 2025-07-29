import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
