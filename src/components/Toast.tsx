"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type ToastMessage = {
  id: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

let toastListeners: Array<(toast: ToastMessage | null) => void> = [];
let currentToast: ToastMessage | null = null;

export function showToast(message: string, action?: { label: string; onClick: () => void }) {
  const id = Math.random().toString(36).substring(7);
  currentToast = { id, message, action };
  toastListeners.forEach((listener) => listener(currentToast));
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    if (currentToast?.id === id) {
      currentToast = null;
      toastListeners.forEach((listener) => listener(null));
    }
  }, 3000);
}

export default function Toast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const listener = (newToast: ToastMessage | null) => {
      setToast(newToast);
    };
    toastListeners.push(listener);

    // Initial check on mount
    const pendingMsg = sessionStorage.getItem("triggerToast");
    if (pendingMsg) {
      sessionStorage.removeItem("triggerToast");
      // Fire it using the standard event path so it gets an ID and auto-dismisses
      setTimeout(() => showToast(pendingMsg), 100);
    }

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  // Also check on pathname change in case component doesn't unmount
  useEffect(() => {
    const pendingMsg = sessionStorage.getItem("triggerToast");
    if (pendingMsg) {
      sessionStorage.removeItem("triggerToast");
      setTimeout(() => showToast(pendingMsg), 100);
    }
  }, [pathname]);

  if (!toast) return null;

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      setToast(null);
    }
  };

  return (
    <div
      className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-[#2f2a26] text-[#faf9f7] px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 text-sm sm:text-base font-medium border border-[#4a3212] transition-all duration-300">
        <span>{toast.message}</span>
        {toast.action && (
          <button
            className="text-[#eadfcd] hover:text-white underline font-semibold transition-colors"
            onClick={handleAction}
            aria-label={toast.action.label}
          >
            {toast.action.label}
          </button>
        )}
        <button
          className="text-gray-400 hover:text-white hover:bg-gray-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-lg leading-none transition-colors"
          onClick={() => setToast(null)}
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
    </div>
  );
}


