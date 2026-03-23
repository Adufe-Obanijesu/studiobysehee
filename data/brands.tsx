"use client";

import React from "react";
import {
  SvgX,
  SvgBlackpink,
  SvgBabyjorn,
  SvgChase,
  SvgCoachella,
  SvgFora,
  SvgModernAge,
  Papyrus,
  SvgRalphLauren,
  SvgRockefellerCenter,
  SvgShef,
  SvgTiktok,
  SvgUbisoft,
  SvgWalmart,
  SvgWellsFargo,
  SvgYoutube,
  Kuzco,
  BasilHayden,
  SVGGoogle,
} from "./brand-svgs";

export type BrandSvgComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export const brands: { alt: string; Svg: BrandSvgComponent }[] = [
  { alt: "Google", Svg: SVGGoogle },
  // { alt: "Kuzco", Svg: Kuzco },
  { alt: "BabyBJorn", Svg: SvgBabyjorn },
  { alt: "Papyrus", Svg: Papyrus },
  { alt: "Wells Fargo", Svg: SvgWellsFargo },
  { alt: "Blackpink", Svg: SvgBlackpink },
  // { alt: "Modern Age", Svg: SvgModernAge },
  { alt: "Coachella", Svg: SvgCoachella },
  { alt: "Ralph Lauren", Svg: SvgRalphLauren },
  { alt: "Rockefeller Center", Svg: SvgRockefellerCenter },
  { alt: "Chase", Svg: SvgChase },
  { alt: "YouTube", Svg: SvgYoutube },
  { alt: "Fora", Svg: SvgFora },
  { alt: "Ubisoft", Svg: SvgUbisoft },
  { alt: "Walmart", Svg: SvgWalmart },
  { alt: "TikTok", Svg: SvgTiktok },
  { alt: "Shef", Svg: SvgShef },
  { alt: "X", Svg: SvgX },
  // { alt: "Basil Hayden", Svg: BasilHayden },
];
