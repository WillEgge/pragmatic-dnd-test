import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { Board, BoardContextType, CardType, ColumnType } from "@/types/type";
import { noop } from "@/utils";
import { supabase } from "@/lib/supabase";

const BoardContext = createContext<BoardContextType>({
  board: { name: "", columns: [] },
  moveCard: noop,
});

const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>({ name: "", columns: [] });

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    const { data, error } = await supabase
      .from("boards")
      .select(
        `
        name,
        columns (
          id,
          name,
          cards (
            id,
            title,
            position,
            column_id
          )
        )
      `
      )
      .single();

    if (error) {
      console.error("Error fetching board:", error);
    } else if (data) {
      setBoard(data);
    }
  };

  const moveCard = useCallback(
    async (cardId: string, targetColumnId: string, targetPosition: number) => {
      const updatedBoard = JSON.parse(JSON.stringify(board));
      let sourceColumn: ColumnType | undefined;
      let card: CardType | undefined;
      let sourceCardIndex: number = -1;

      for (const column of updatedBoard.columns) {
        sourceCardIndex = column.cards.findIndex((c) => c.id === cardId);
        if (sourceCardIndex !== -1) {
          sourceColumn = column;
          card = column.cards[sourceCardIndex];
          break;
        }
      }

      if (!sourceColumn || !card) {
        console.error("Card not found");
        return;
      }

      const targetColumn = updatedBoard.columns.find(
        (col) => col.id === targetColumnId
      );

      if (!targetColumn) {
        console.error("Target column not found");
        return;
      }

      sourceColumn.cards.splice(sourceCardIndex, 1);

      let insertIndex: number;
      if (
        targetPosition === -1 ||
        targetPosition >= targetColumn.cards.length
      ) {
        insertIndex = targetColumn.cards.length;
      } else if (targetPosition === 0) {
        insertIndex = 0;
      } else {
        insertIndex = targetPosition;
      }

      targetColumn.cards.splice(insertIndex, 0, {
        ...card,
        column_id: targetColumnId,
      });

      const updatePositions = (column: ColumnType) => {
        column.cards.forEach((c, index) => {
          c.position = index;
        });
      };

      updatePositions(targetColumn);
      if (sourceColumn !== targetColumn) {
        updatePositions(sourceColumn);
      }

      setBoard(updatedBoard);

      // Update the card in Supabase
      const { error } = await supabase
        .from("cards")
        .update({
          column_id: targetColumnId,
          position: insertIndex,
        })
        .eq("id", cardId);

      if (error) {
        console.error("Error updating card:", error);
        // Revert the local state if the update fails
        fetchBoard();
      }
    },
    [board]
  );

  return (
    <BoardContext.Provider value={{ board, moveCard }}>
      {children}
    </BoardContext.Provider>
  );
};

const useBoard = () => useContext(BoardContext);

export { BoardProvider, useBoard };