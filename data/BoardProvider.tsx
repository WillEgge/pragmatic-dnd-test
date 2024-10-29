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
  addCard: async () => null,
  deleteCard: async () => {},
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
      // Ensure cards are sorted by position
      const sortedColumns = data.columns.map((column: ColumnType) => ({
        ...column,
        cards: column.cards.sort((a, b) => a.position - b.position),
      }));
      setBoard({ ...data, columns: sortedColumns });
    }
  };

  const moveCard = useCallback(
    async (cardId: string, targetColumnId: string, targetPosition: number) => {
      if (!cardId || !targetColumnId || isNaN(targetPosition)) {
        console.error("Invalid parameters passed to moveCard");
        return;
      }

      const updatedBoard = JSON.parse(JSON.stringify(board));
      let sourceColumn: ColumnType | undefined;
      let card: CardType | undefined;
      let sourceCardIndex: number = -1;

      // Find the source column and the card
      for (const column of updatedBoard.columns) {
        sourceCardIndex = column.cards.findIndex(
          (c: CardType) => c.id === cardId
        );
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
        (col: ColumnType) => col.id === targetColumnId
      );

      if (!targetColumn) {
        console.error("Target column not found");
        return;
      }

      // Remove the card from the source column
      sourceColumn.cards.splice(sourceCardIndex, 1);

      // Determine the insert index
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

      // Insert the card into the target column
      targetColumn.cards.splice(insertIndex, 0, {
        ...card,
        column_id: targetColumnId,
      });

      // Update positions in the target column
      targetColumn.cards.forEach((c: CardType, index: number) => {
        c.position = index;
      });

      // If moving to a different column, update positions in the source column
      if (sourceColumn !== targetColumn) {
        sourceColumn.cards.forEach((c: CardType, index: number) => {
          c.position = index;
        });
      }

      // Update the local board state
      setBoard(updatedBoard);

      try {
        // Begin Supabase transactions
        const updates: any[] = [];

        // Update the moved card
        updates.push(
          supabase
            .from("cards")
            .update({
              column_id: targetColumnId,
              position: insertIndex,
            })
            .eq("id", cardId)
        );

        // Update positions in the target column
        targetColumn.cards.forEach((c: CardType, index: number) => {
          updates.push(
            supabase.from("cards").update({ position: index }).eq("id", c.id)
          );
        });

        // If moved to a different column, update positions in the source column
        if (sourceColumn !== targetColumn) {
          sourceColumn.cards.forEach((c: CardType, index: number) => {
            updates.push(
              supabase.from("cards").update({ position: index }).eq("id", c.id)
            );
          });
        }

        // Execute all updates in parallel
        const results = await Promise.all(updates);

        // Check for errors
        results.forEach(({ error }) => {
          if (error) {
            throw error;
          }
        });
      } catch (error) {
        console.error("Error updating cards:", error);
        // Revert local state if any update fails
        fetchBoard();
      }
    },
    [board]
  );

  const addCard = useCallback(
    async (newCard: Omit<CardType, "id">) => {
      const { data, error } = await supabase
        .from("cards")
        .insert(newCard)
        .select()
        .single();

      if (error) {
        console.error("Error adding new card:", error);
        throw error;
      }

      if (data) {
        const updatedBoard = { ...board };
        const targetColumn = updatedBoard.columns.find(
          (col) => col.id === newCard.column_id
        );
        if (targetColumn) {
          targetColumn.cards.push(data);
          targetColumn.cards.sort((a, b) => a.position - b.position);
          setBoard(updatedBoard);
        }
      }

      return data;
    },
    [board]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      const { error } = await supabase.from("cards").delete().eq("id", cardId);

      if (error) {
        console.error("Error deleting card:", error);
        throw error;
      }

      // Remove the card from the local state
      const updatedBoard = JSON.parse(JSON.stringify(board));
      updatedBoard.columns.forEach((column: ColumnType) => {
        column.cards = column.cards.filter((card) => card.id !== cardId);
        // Update positions after deletion
        column.cards.forEach((card: CardType, index: number) => {
          card.position = index;
        });
      });
      setBoard(updatedBoard);
    },
    [board]
  );

  return (
    <BoardContext.Provider value={{ board, moveCard, addCard, deleteCard }}>
      {children}
    </BoardContext.Provider>
  );
};

const useBoard = () => useContext(BoardContext);

export { BoardProvider, useBoard };
