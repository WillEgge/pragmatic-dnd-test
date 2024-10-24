import { CardType } from "@/types/type";
import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

import { useBoard } from "@/data/BoardProvider";

export const Card = ({ card }: { card: CardType }) => {
  const { id, title } = card;
  const ref = useRef(null);
  const [isDragging, setDragging] = useState(false);

  const [aboutToDrop, setAboutToDrop] = useState(false);


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
      canDrop({ source }) {
        return source.element !== element;
      },
      onDragEnter() {
        setAboutToDrop(true);
      },
      onDragLeave() {
        setAboutToDrop(false);
      },
      onDrop() {
        setAboutToDrop(false);
        const target = self;
        
      },
    };

    return combine(draggable(dragConfig), dropTargetForElements(dropConfig));
  }, [card]);

  return (
    <li
      ref={ref}
      data-test-id={id}
      className={`relative p-2 bg-gradient-to-br from-slate-100 to-slate-200 drop-shadow-sm rounded-md text-lg hover:cursor-grab ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="bg-orange-500 text-white rounded-sm py-0.5 px-1 text-xs text-center">
        {id}
      </span>
      <p className="text-slate-800">{title}</p>
    </li>
  );
};