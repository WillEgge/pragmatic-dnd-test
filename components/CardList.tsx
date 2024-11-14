import React from "react";
import { CardType } from "@/types/type";
import { Card } from "./Card";
import { DropTarget } from "./DropTarget";

export const CardList = ({
  cards,
  columnId,
}: {
  cards: CardType[];
  columnId: string;
}) => {
  return (
    <ol className="space-y-2">
      {" "}
      {/* Reduced spacing from 'space-y-4' to 'space-y-2' */}
      <DropTarget columnId={columnId} position={0} />
      {cards.map((card, index) => (
        <React.Fragment key={card.id}>
          <Card card={card} />
          <DropTarget columnId={columnId} position={index + 1} />
        </React.Fragment>
      ))}
    </ol>
  );
};