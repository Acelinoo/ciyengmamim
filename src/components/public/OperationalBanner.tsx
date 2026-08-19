"use client";

import { LiveOperationalStatus } from "@/lib/operational";
import { Clock, AlertCircle } from "lucide-react";

interface OperationalBannerProps {
  status: LiveOperationalStatus;
}

export function OperationalBanner({ status }: OperationalBannerProps) {
  if (status.isOpen) {
    return (
      <div className="bg-[#F0FDF4] text-[#166534] text-xs md:text-sm py-2 px-4 border-b border-[#DCFCE7] flex items-center justify-center gap-2 font-bold">
        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
        <span>{status.message}</span>
        <span className="hidden md:inline text-[#15803D] font-medium">• {status.nextScheduleInfo}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#FEF3C7] text-[#92400E] text-xs md:text-sm py-2.5 px-4 border-b border-[#FDE68A] flex items-center justify-center gap-2 font-bold">
      <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
      <span>{status.message}</span>
      <span className="hidden md:inline text-[#B45309] font-medium">• {status.nextScheduleInfo}</span>
    </div>
  );
}
