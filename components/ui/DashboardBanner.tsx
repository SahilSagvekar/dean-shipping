"use client";

import React from "react";

interface DashboardBannerProps {
  imageSrc: string;
  alt: string;
  title?: string;
  subtitle?: string;
  overlay?: boolean;
  objectFit?: "cover" | "contain";
  className?: string;
}

export function DashboardBanner({
  imageSrc,
  alt,
  title,
  subtitle,
  overlay = false,
  objectFit = "cover",
  className = "",
}: DashboardBannerProps) {
  return (
    <div className={`relative w-full h-[250px] sm:h-[300px] md:h-[400px] overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain"}`}
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-12">
          {title && (
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-white/80 text-sm md:text-xl font-medium mt-2 uppercase tracking-[0.2em]">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
