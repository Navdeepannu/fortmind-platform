import Link from "next/link";
import { ModeToggle } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-start max-w-7xl mx-auto py-32">
      <ModeToggle />
      <Button nativeButton={false} variant="outline" render={<Link href="/platform" />}>Open platform</Button>
      <div className="flex flex-col gap-6 selection:bg-primary selection:text-white">
        <h1 className="text-[76px] leading-20 text-balance font-semibold tracking-tight">
          From security alerts to confident decisions
        </h1>
        <p className="text-[20px] font-normal text-balance leading-6 max-w-4xl">
          Fortmind brings AI-powered investigation and human expertise together
          to cut through alert noise, accelerate threat analysis, and help
          security teams focus on what matters most.
        </p>

        <div className="flex items-center gap-4">
          <Button
            className="rounded-full px-4 h-11 font-medium"
            variant="default"
            size="lg"
          >
            Book a Demo
          </Button>

          <Button
            className="rounded-full h-11 px-4"
            variant="outline"
            size="lg"
          >
            How it works
          </Button>
        </div>
      </div>
    </div>
  );
}
