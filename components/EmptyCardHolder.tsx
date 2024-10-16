import React, { useEffect, useRef, useState, useCallback } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const EmptyCardHolder = ({ column_id }: { column_id: string }) => {
  const [aboutToDrop, setAboutToDrop] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null);

  const getDropTargetConfig = useCallback(
    () => ({
      element: ref.current as HTMLElement,
      getData: () => ({
        id: "placeholder",
        position: 0,
        column_id: column_id,
      }),
      onDragEnter: () => setAboutToDrop(true),
      onDragLeave: () => setAboutToDrop(false),
      onDrop: () => setAboutToDrop(false),
    }),
    [column_id]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const unsubscribe = dropTargetForElements(getDropTargetConfig());
    return () => unsubscribe();
  }, [getDropTargetConfig]);

  return (
    <ol className="p-5 flex flex-col gap-4" data-test-id={column_id}>
      <li
        ref={ref}
        className={`relative p-2 h-8 | ${aboutToDrop ? "bg-green-200" : ""}`}
      />
    </ol>
  );
};

export { EmptyCardHolder };