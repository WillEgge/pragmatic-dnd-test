import { Column } from "./Column";
import { useBoard } from "@/data/BoardProvider";

const Board = () => {
  const { board } = useBoard();

  return (
    <div className="flex flex-col m-auto bg-white h-screen overflow-auto">
      <h1 className="mx-10 my-4 text-2xl">{board.name}</h1>
      <ol className="max-h-full mx-10 my-4 flex flex-row gap-6 flex-grow">
        {board.columns.map((col) => (
          <Column key={col.id} column={col} />
        ))}
      </ol>
    </div>
  );
};

export { Board };