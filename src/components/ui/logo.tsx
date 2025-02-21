'use client';

import React from 'react';
import { branding } from '@/lib/branding';
import Link from 'next/link';
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  const { icon: LogoIcon, text } = branding.logo;

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoIcon className="h-6 w-6 text-brand" />
      <span className="font-semibold text-brand">{text}</span>
    </Link>
  );
} 