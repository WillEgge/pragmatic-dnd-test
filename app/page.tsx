"use client";

import { BoardProvider } from "@/data/BoardProvider";
import { Board } from "@/components/Board";
import AddCardForm from "@/components/AddCardForm";

export default function Home() {
  return (
    <BoardProvider>
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <AddCardForm />
        <Board />
      </div>
    </BoardProvider>
  );
}