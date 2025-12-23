"use client";

import React, { useState } from "react";
import Image from "next/image";
import logoImg from "@/assets/logo.png";

export default function Logo() {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {!error ? (
        <Image
          src={logoImg}
          alt="Logo"
          fill
          className="object-contain group-hover:scale-110 transition-transform"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full bg-emerald-500 rounded-xl flex items-center justify-center text-black font-black text-lg">
          NX
        </div>
      )}
    </div>
  );
}
