import Image from "next/image";
import React from "react";

export default function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50  to-secondary/50 pointer-events-none"></div>
        <div className="relative border-t border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-8 py-3">
            <div className="flex items-center justify-center gap-3 text-center">
              {/* <span className="text-sm text-gray-600">© {year}</span> */}
              <span className="text-sm text-gray-600">جميع الحقوق محفوظة لشركة</span>
              <a
                href="https://dwam-tech.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DWAM Tech"
                className="inline-flex items-center gap-3 group"
              >
                <span className="relative h-9 w-9 rounded-full ring-1 ring-gray-300 shadow-sm bg-gray-100 overflow-hidden">
                  <Image
                    src="/dwam.png"
                    alt="DWAM Tech"
                    fill
                    sizes="36px"
                    className="object-contain"
                    priority
                  />
                </span>
                {/* <span className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                  DWAM TECH
                </span> */}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
