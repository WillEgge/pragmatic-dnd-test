import { CardType } from "@/types/type";
import { useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"; // This is the drag-and-drop adapter
import { Trash2 } from "lucide-react";
import { useBoard } from "@/data/BoardProvider";
import { useToast } from "@/hooks/use-toast";

export const Card = ({ card }: { card: CardType }) => {
  const { id, title } = card;
  const ref = useRef(null);
  const [isDragging, setDragging] = useState(false);
  const { moveCard, deleteCard } = useBoard();
  const { toast } = useToast();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const dragConfig = {
      element,
      getInitialData() {
        return card;
      },
      onDragStart() {
        setDragging(true);
      },
      onDrop() {
        setDragging(false);
      },
    };

    // Register draggable and get cleanup function
    const cleanupFn = draggable(dragConfig);

    // Cleanup when the component is unmounted or the card changes
    return () => {
      cleanupFn(); // Call the cleanup function directly instead of destroy
    };
  }, [card, moveCard]); // Dependencies ensure it runs on card changes

  const handleDelete = async () => {
    try {
      await deleteCard(id);
      toast({
        title: "Success",
        description: "Card has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the card.",
        variant: "destructive",
      });
    }
  };

  return (
    <li
      ref={ref}
      data-test-id={id}
      className={`relative p-2 bg-gradient-to-br from-slate-100 to-slate-200 drop-shadow-sm rounded-md text-lg hover:cursor-grab group ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="bg-orange-500 text-white rounded-sm py-0.5 px-1 text-xs text-center">
        {id}
      </span>
      <p className="text-slate-800">{title}</p>
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 hover:text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
};
