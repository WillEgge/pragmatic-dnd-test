import { CardType } from "@/types/type";
import { Card } from "./Card";

export const CardList = ({ cards }: { cards: CardType[] }) => {
  return (
    <ol className="p-4 flex flex-col gap-4">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </ol>
  );
};