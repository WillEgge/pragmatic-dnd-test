"use client";

import { BoardProvider } from "@/data/BoardProvider";
import { Board } from "@/components/Board";

export default function Home() {
  return (
    <BoardProvider>
      <Board />
    </BoardProvider>
  );
}