import React, { useEffect, useRef, useState, useCallback } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useBoard } from "@/data/BoardProvider";
import { CardType } from "@/types/type";

const DropTarget = ({
  columnId,
  position,
}: {
  columnId: string;
  position: number;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isAdjacent, setIsAdjacent] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { moveCard } = useBoard();

  const getDropTargetConfig = useCallback(
    () => ({
      element: ref.current as HTMLElement,
      getData: () => ({
        column_id: columnId,
        position: position,
      }),
      onDragEnter: (args: any) => {
        const source = args.data as CardType;
        if (source) {
          const isSameColumn = source.column_id === columnId;
          const isAdjacentPosition =
            isSameColumn && Math.abs(source.position - position) <= 1;

          if (!isSameColumn || !isAdjacentPosition) {
            setIsHovering(true);
          } else {
            setIsHovering(false);
          }

          setIsAdjacent(isAdjacentPosition);
        }
      },
      onDragLeave: () => {
        setIsHovering(false);
        setIsAdjacent(false);
      },
      onDrop: (args: any) => {
        const sourceData = args.data as CardType;

        if (sourceData && sourceData.id) {
          const isSameColumn = sourceData.column_id === columnId;
          const isAdjacentPosition =
            isSameColumn && Math.abs(sourceData.position - position) <= 1;

          if (!isAdjacentPosition) {
            moveCard(sourceData.id, columnId, position);
          }
        }
        setIsHovering(false);
      },
    }),
    [columnId, position, moveCard]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const unsubscribe = dropTargetForElements(getDropTargetConfig());
    return () => unsubscribe();
  }, [getDropTargetConfig]);

  return (
    <div
      ref={ref}
      className={`h-2 my-1 transition-colors ${
        isHovering && !isAdjacent ? "bg-green-200" : "bg-transparent"
      }`}
    />
  );
};

export { DropTarget };