import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-ink/20 border-t-teal" />
        <Image
          src="/logo-icon.png"
          alt=""
          width={56}
          height={56}
          className="h-8 w-8"
        />
      </div>
    </div>
  );
}