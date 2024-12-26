import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GAME_TITLE, GAME_INTRO } from "@/lib/openai";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-bold mb-6">{GAME_TITLE}</h1>
      <p className="text-lg mb-8 max-w-2xl whitespace-pre-line">
        {GAME_INTRO}
      </p>
      <Link href="/game">
        <Button size="lg">Start Investigation</Button>
      </Link>
    </main>
  );
} 