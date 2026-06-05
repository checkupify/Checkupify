"use client";
import React from "react";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  fullWidth?: boolean;
}

export function Button({ children, onClick, variant = "outline", size = "md", disabled, loading, type = "button", className, fullWidth }: Props) {
  const sizeMap = { xs: "sm", sm: "sm", md: "", lg: "lg" };
  const varMap = { primary: "primary", secondary: "", outline: "", ghost: "", danger: "danger" };
  const classes = ["btn", varMap[variant], sizeMap[size], fullWidth ? "full" : "", className].filter(Boolean).join(" ");
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={classes}>
      {loading && <span className="spin-sm" style={{ width: 14, height: 14, flexShrink: 0 }} />}
      {children}
    </button>
  );
}
