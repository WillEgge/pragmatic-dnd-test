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
import { useToast } from "@/hooks/use-toast";

const BoardContext = createContext<BoardContextType>({
  board: { name: "", columns: [] },
  moveCard: noop,
  addCard: async () => null,
  deleteCard: async () => {},
});

const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>({ name: "", columns: [] });
  const { toast } = useToast();

  // Memoize the fetchBoard function to prevent unnecessary re-renders
  const fetchBoard = useCallback(async () => {
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
      toast({
        title: "Error",
        description: "Failed to fetch the board. Please try again.",
        variant: "destructive",
      });
    } else if (data) {
      const sortedColumns = data.columns.map((column: ColumnType) => ({
        ...column,
        cards: column.cards.sort((a, b) => a.position - b.position),
      }));
      setBoard({ ...data, columns: sortedColumns });
    }
  }, [toast]); // Add toast as a dependency

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]); // Add fetchBoard as a dependency

  const moveCard = useCallback(
    async (cardId: string, targetColumnId: string, targetPosition: number) => {
      console.log(
        `Attempting to move card ${cardId} to column ${targetColumnId} at position ${targetPosition}`
      );

      if (!cardId || !targetColumnId || isNaN(targetPosition)) {
        console.error("Invalid parameters passed to moveCard");
        toast({
          title: "Error",
          description: "Invalid parameters for moving the card.",
          variant: "destructive",
        });
        return;
      }

      setBoard((prevBoard) => {
        const updatedBoard: Board = {
          ...prevBoard,
          columns: prevBoard.columns.map((col) => ({
            ...col,
            cards: [...col.cards],
          })),
        };

        let sourceColumn: ColumnType | undefined;
        let card: CardType | undefined;
        let sourceCardIndex: number = -1;

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
          console.error(`Card not found: ${cardId}`);
          toast({
            title: "Error",
            description: `Card with ID ${cardId} not found.`,
            variant: "destructive",
          });
          return prevBoard;
        }

        const targetColumn = updatedBoard.columns.find(
          (col: ColumnType) => col.id === targetColumnId
        );

        if (!targetColumn) {
          console.error("Target column not found");
          toast({
            title: "Error",
            description: "Target column not found.",
            variant: "destructive",
          });
          return prevBoard;
        }

        // Remove card from source column
        sourceColumn.cards.splice(sourceCardIndex, 1);

        // Correctly calculate insert index (fix overshooting)
        let insertIndex: number = targetPosition;
        if (
          targetPosition === -1 ||
          targetPosition >= targetColumn.cards.length
        ) {
          insertIndex = targetColumn.cards.length;
        } else {
          if (targetPosition > sourceCardIndex) {
            insertIndex = targetPosition - 1; // Avoid overshooting when moving downward
          }
        }

        targetColumn.cards.splice(insertIndex, 0, {
          ...card,
          column_id: targetColumnId,
        });

        targetColumn.cards.forEach((c: CardType, index: number) => {
          c.position = index;
        });

        if (sourceColumn !== targetColumn) {
          sourceColumn.cards.forEach((c: CardType, index: number) => {
            c.position = index;
          });
        }

        return updatedBoard;
      });

      try {
        const updates: any[] = [];

        updates.push(
          supabase
            .from("cards")
            .update({
              column_id: targetColumnId,
              position: targetPosition,
            })
            .eq("id", cardId)
        );

        const targetCol = board.columns.find(
          (col) => col.id === targetColumnId
        );
        if (targetCol) {
          targetCol.cards.forEach((c: CardType, index: number) => {
            updates.push(
              supabase.from("cards").update({ position: index }).eq("id", c.id)
            );
          });
        }

        const results = await Promise.all(updates);

        let hasError = false;
        results.forEach(({ error }) => {
          if (error) {
            hasError = true;
            console.error("Error updating cards:", error);
          }
        });

        if (hasError) {
          throw new Error("One or more updates failed.");
        }

        toast({
          title: "Success",
          description: "Card moved successfully.",
        });
      } catch (error) {
        console.error("Error during moveCard:", error);
        toast({
          title: "Error",
          description: "Failed to move the card. Reverting changes.",
          variant: "destructive",
        });
        fetchBoard();
      }
    },
    [board.columns, toast, fetchBoard] // Add fetchBoard to the dependencies here as well
  );

  const addCard = useCallback(
    async (newCard: Omit<CardType, "id">) => {
      try {
        const { data, error } = await supabase
          .from("cards")
          .insert(newCard)
          .select()
          .single();

        if (error) {
          console.error("Error adding new card:", error);
          toast({
            title: "Error",
            description: "Failed to add the new card.",
            variant: "destructive",
          });
          throw error;
        }

        if (data) {
          setBoard((prevBoard) => {
            const updatedBoard: Board = {
              ...prevBoard,
              columns: prevBoard.columns.map((col) =>
                col.id === newCard.column_id
                  ? {
                      ...col,
                      cards: [...col.cards, data].sort(
                        (a, b) => a.position - b.position
                      ),
                    }
                  : col
              ),
            };
            return updatedBoard;
          });
          toast({
            title: "Success",
            description: "New card added successfully.",
          });
          return data;
        }
      } catch (error) {
        return null;
      }
    },
    [toast]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      const previousBoard = board;
      setBoard((prevBoard) => ({
        ...prevBoard,
        columns: prevBoard.columns.map((col) => ({
          ...col,
          cards: col.cards
            .filter((card) => card.id !== cardId)
            .map((card, index) => ({ ...card, position: index })),
        })),
      }));

      try {
        const { error } = await supabase
          .from("cards")
          .delete()
          .eq("id", cardId);

        if (error) {
          console.error("Error deleting card:", error);
          toast({
            title: "Error",
            description: "Failed to delete the card.",
            variant: "destructive",
          });
          setBoard(previousBoard);
          throw error;
        }

        toast({
          title: "Success",
          description: "Card deleted successfully.",
        });
      } catch (error) {}
    },
    [board, toast]
  );

  return (
    <BoardContext.Provider value={{ board, moveCard, addCard, deleteCard }}>
      {children}
    </BoardContext.Provider>
  );
};

const useBoard = () => useContext(BoardContext);

export { BoardProvider, useBoard };
