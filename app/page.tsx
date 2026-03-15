import Image from "next/image";
import Preloader from "@/components/Preloader";

export default function Home() {
  return (
    <main className="">
      <Preloader />
      <h1>This is a heading</h1>
      <p>This is a paragraph</p>
    </main>
  );
}
