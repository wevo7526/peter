import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        <Image
          src="/peter.png"
          alt="Peter Logo"
          width={300}
          height={300}
          priority
          className="mb-8"
        />
        <Link href="/auth">
          <button className="relative px-8 py-4 text-lg font-semibold text-white bg-emerald-500 rounded-lg overflow-hidden group hover:bg-emerald-600 transition-all duration-300">
            <span className="relative z-10">Enter</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </Link>
      </div>
    </div>
  );
}
