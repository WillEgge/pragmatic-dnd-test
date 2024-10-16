import { ColumnType, CardType } from "@/types/type";
import { EmptyCardHolder } from "./EmptyCardHolder";
import { CardList } from "./CardList";
import { useEffect, useRef } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useBoard } from "@/data/BoardProvider";

export const Column = ({ column }: { column: ColumnType }) => {
  const { id, name, cards } = column;
  const ref = useRef<HTMLDivElement | null>(null);
  const { moveCard } = useBoard();

  useEffect(() => {
    monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];

        if (!source || !target) {
          return;
        }

        const sourceData = source.data as CardType;
        const targetData = target.data as CardType & { column_id: string };

        if (!sourceData || !targetData) {
          return;
        }

        if (targetData.id === "placeholder") {
          moveCard(sourceData.id, targetData.column_id, 0);
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

          moveCard(sourceData.id, targetData.column_id, targetPosition);
        }
      },
    });
  }, [moveCard, cards]);

  return (
    <div className="bg-gray-100 rounded-lg p-4 shadow-md" ref={ref}>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{name}</h2>
      <div>
        {cards.length > 0 ? (
          <CardList cards={cards} />
        ) : (
          <EmptyCardHolder column_id={id} />
        )}
      </div>
    </div>
  );
};
