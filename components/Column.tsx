import React from "react";
import { ColumnType, CardType } from "@/types/type";
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
        const targetData = target.data as {
          column_id: string;
          position: number;
        };

        if (!sourceData || !targetData) {
          return;
        }

        moveCard(sourceData.id, targetData.column_id, targetData.position);
      },
    });
  }, [moveCard, cards]);

  return (
    <div className="bg-gray-100 rounded-lg p-4 shadow-md" ref={ref}>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{name}</h2>
      <div>
        <CardList cards={cards} columnId={id} />
      </div>
    </div>
  );
};
