import React, { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const EmptyCardHolder = ({ column_id }: { column_id: string }) => {
  const [aboutToDrop, setAboutToDrop] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    return dropTargetForElements({
      element,
      getData() {
        return {
          id: "placeholder",
          position: 0,
          column_id: column_id,
        }
      },
      onDragEnter() {
        setAboutToDrop(true);
      },
      onDragLeave() {
        setAboutToDrop(false);
      },
      onDrop() {
        setAboutToDrop(false);
      },
    });
  }, []);

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