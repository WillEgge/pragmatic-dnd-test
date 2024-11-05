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
  const ref = useRef<HTMLDivElement | null>(null);
  const { moveCard } = useBoard();

  const getDropTargetConfig = useCallback(
    () => ({
      element: ref.current as HTMLElement,
      getData: () => ({
        column_id: columnId,
        position: position,
      }),
      onDragEnter: () => setIsHovering(true),
      onDragLeave: () => setIsHovering(false),
      onDrop: (args: any) => {
        // Changed parameter type to 'any'
        const data = args.data as CardType; // Type assertion
        if (data && data.id) {
          moveCard(data.id, columnId, position);
          setIsHovering(false);
        }
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
      className={`h-4 my-2 transition-colors ${
        isHovering ? "bg-green-200" : "bg-transparent"
      }`}
    />
  );
};

export { DropTarget };