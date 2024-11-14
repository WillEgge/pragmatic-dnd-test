import React, { useState } from "react";
import { useBoard } from "@/data/BoardProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const AddCardForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const { board, addCard } = useBoard();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Assign the To Do column to a variable to handle undefined case
  const todoColumn = board.columns.find(
    (col) => col.id === "133ebdb0-3d5d-44e8-ba7c-2b976b372143"
  );

  // Determine the default position
  const defaultPosition = todoColumn
    ? Math.max(todoColumn.cards.length - 1, 0)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    if (!todoColumn) {
      toast({
        title: "Error",
        description:
          "The To Do column could not be found. Please check the column ID.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Determine the position
      let finalPosition: number;
      if (position.trim() === "") {
        finalPosition = defaultPosition; // Use default position
        console.log(
          `No position provided. Setting default position to ${finalPosition}`
        );
      } else {
        finalPosition = parseInt(position, 10);
        if (isNaN(finalPosition)) {
          throw new Error("Invalid position number.");
        }
        console.log(`Position provided by user: ${finalPosition}`);
      }

      const newCardData = {
        title,
        position: finalPosition,
        column_id: todoColumn.id,
      };

      const newCard = await addCard(newCardData);

      if (newCard) {
        // Reset form fields
        setTitle("");
        setPosition("");
      }
    } catch (error) {
      console.error("Error adding new card:", error);
      // Error handling is already managed in BoardProvider
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-white rounded-md shadow"
    >
      <h2 className="text-lg font-semibold mb-4">Add New Card</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <div>
          <Label htmlFor="position">Position (optional)</Label>
          <Input
            id="position"
            type="number"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            // Removed 'required' attribute to make it optional
            placeholder={`Default: ${defaultPosition}`}
            disabled={isSubmitting} // Disable input while submitting
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Card"}
        </Button>
      </div>
    </form>
  );
};

export default AddCardForm;