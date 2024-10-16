import { Column } from "./Column";
import { useBoard } from "@/data/BoardProvider";

const Board = () => {
  const { board } = useBoard();

  return (
    <div className="flex flex-col min-h-screen bg-white w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">{board.name}</h1>
      <div className="space-y-6">
        {board.columns.map((col) => (
          <Column key={col.id} column={col} />
        ))}
      </div>
    </div>
  );
};

export { Board };