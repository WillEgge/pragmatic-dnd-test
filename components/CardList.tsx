import { CardType } from "@/types/type";
import { Card } from "./Card";

export const CardList = ({ cards }: { cards: CardType[] }) => {
  return (
    <ol className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </ol>
  );
};