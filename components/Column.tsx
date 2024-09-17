import { ColumnType } from "@/types/type";
import { EmptyCardHolder } from "./EmptyCardHolder";
import { CardList } from "./CardList";
import { useEffect, useRef, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useBoard } from "@/data/BoardProvider";

export const Column = ({ column }: { column: ColumnType }) => {
  const { id, name, cards } = column;
  const ref = useRef<HTMLLIElement | null>(null);
  const [highlight, setHighlight] = useState(false);
  const { moveCard } = useBoard();

  useEffect(() => {
    const element = ref.current;

    const monitorConfig = {
      element,
      onDrag({ location }) {
        const target = location.current.dropTargets[0];

        if (!target) {
          return;
        }

        if (target.data.columnId === id) {
          setHighlight(true);
        } else {
          setHighlight(false);
        }
      },
      onDrop() {
        setHighlight(false);
      },
    };

    return monitorForElements(monitorConfig);
  }, [id]);

  useEffect(() => {
    monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];

        if (!source || !target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!sourceData || !targetData) {
          return;
        }

        if (targetData.id === "placeholder") {
          moveCard(sourceData.id, targetData.columnId, 0);
        } else {
          const indexOfTarget: number = cards.findIndex(
            (card) => card.id === targetData.id
          );

          let targetPosition: number = -1;
          if (indexOfTarget === 0) {
            targetPosition = 0;
          } else if (indexOfTarget === cards.length - 1) {
            targetPosition = -1;
          } else {
            targetPosition = targetData.position;
          }
          
          moveCard(sourceData.id, targetData.columnId, targetPosition);
        }
      },
    });
  }, [moveCard]);

  return (
    <li
      className={`w-72 h-full shrink-0 ${
        highlight ? "bg-blue-100" : "bg-gray-50"
      } rounded-md`}
      ref={ref}
    >
      <h2 className="p-4 text-slate-700">{name}</h2>
      {cards.length > 0 ? (
        <CardList cards={cards} />
      ) : (
        <EmptyCardHolder columnId={id} />
      )}
    </li>
  );
};
