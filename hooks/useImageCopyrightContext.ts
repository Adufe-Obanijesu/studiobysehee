"use client";

import { useMemo } from "react";

export function useImageCopyrightContext() {
  const copyrightNotice = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return (
      `This photo is copyrighted © ${currentYear} \nStudio by Sehee. All rights reserved.`
    );
  }, []);

  return {
    copyrightNotice,
  };
}
