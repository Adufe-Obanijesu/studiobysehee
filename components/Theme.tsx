import gsap from "gsap";
import { GSDevTools } from "gsap/GSDevTools";

gsap.registerPlugin(GSDevTools)

export default function Theme({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}