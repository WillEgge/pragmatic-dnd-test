import React, { useState } from "react";
import { useBoard } from "@/data/BoardProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const AddCardForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const { board, addCard } = useBoard();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const todoColumnId = "133ebdb0-3d5d-44e8-ba7c-2b976b372143";
    const todoColumn = board.columns.find((col) => col.id === todoColumnId);

    if (!todoColumn) {
      toast({
        title: "Error",
        description:
          "The To Do column could not be found. Please check the column ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCard = await addCard({
        title,
        position: parseInt(position),
        column_id: todoColumnId,
      });

      if (newCard) {
        toast({
          title: "Success",
          description: "New card has been added successfully.",
        });

        // Reset form fields
        setTitle("");
        setPosition("");
      }
    } catch (error) {
      console.error("Error adding new card:", error);
      toast({
        title: "Error",
        description:
          "There was an error adding the new card. Please try again.",
        variant: "destructive",
      });
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
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            type="number"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Add Card</Button>
      </div>
    </form>
  );
};

export default AddCardForm;