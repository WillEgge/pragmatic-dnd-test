import { CardType } from "@/types/type";
import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
  ElementDragPayload,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
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

    const dropConfig = {
      element,
      getData() {
        return card;
      },
      canDrop({ source }: { source: ElementDragPayload }): boolean {
        return source.element !== element;
      },
      onDrop({
        source,
        self,
      }: {
        source: ElementDragPayload;
        self: DropTargetRecord;
      }): void {
        const target = self;
        if (!source || !target) {
          return;
        }

        const sourceData = source.data as CardType;
        const targetData = target.data as CardType;

        if (!sourceData || !targetData) {
          return;
        }

        if (
          typeof targetData.column_id === "undefined" ||
          typeof targetData.position === "undefined"
        ) {
          console.error("targetData is missing column_id or position");
          return;
        }

        moveCard(sourceData.id, targetData.column_id, targetData.position + 1);
      },
    };
    //,
    // onDragEnter() {
    //   setAboutToDrop(true);
    // },
    // onDragLeave() {
    //   setAboutToDrop(false);
    // },
    // onDrop() {
    // setAboutToDrop(false);
    // const target = self;

    // },
    // };

    return combine(draggable(dragConfig), dropTargetForElements(dropConfig));
    // return draggable(dragConfig);
  }, [card, moveCard]);

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
