"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  monitorForElements,
  dropTargetForElements,
  reorder,
} from "@atlaskit/pragmatic-drag-and-drop";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/adapter/beautiful-dnd";
import { supabase } from "@/lib/supabase";

interface Task {
  id: string;
  content: string;
  order: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks();

    const cleanup = monitorForElements({
      onDragStart: ({ source }) => {
        source.node.classList.add("dragging");
      },
      onDrop: async ({ source, destination }) => {
        if (!destination) return;

        const sourceIndex = Number(source.data.index);
        const destinationIndex = Number(destination.data.index);

        setTasks((tasks) => {
          const newTasks = reorder(tasks, sourceIndex, destinationIndex);
          updateTasksOrder(newTasks);
          return newTasks;
        });
      },
      onDragEnd: ({ source }) => {
        source.node.classList.remove("dragging");
      },
    });

    return cleanup;
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("order", { ascending: true });

    if (error) console.log("error", error);
    else setTasks(data || []);
  };

  const addTask = useCallback(async () => {
    if (newTask.trim() !== "") {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ content: newTask, order: tasks.length })
        .select();

      if (error) console.log("error", error);
      else {
        setTasks((prev) => [...prev, data[0]]);
        setNewTask("");
      }
    }
  }, [newTask, tasks.length]);

  const updateTasksOrder = async (newTasks: Task[]) => {
    for (let i = 0; i < newTasks.length; i++) {
      const { error } = await supabase
        .from("tasks")
        .update({ order: i })
        .eq("id", newTasks[i].id);

      if (error) console.log("error", error);
    }
  };

  useEffect(() => {
    const taskList = document.getElementById("task-list");
    if (taskList) {
      dropTargetForElements({
        element: taskList,
      });
    }

    tasks.forEach((task, index) => {
      const taskElement = document.getElementById(`task-${task.id}`);
      if (taskElement) {
        draggable({
          element: taskElement,
          data: { index },
        });
      }
    });
  }, [tasks]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Task List</h1>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task"
          />
          <Button onClick={addTask}>Add Task</Button>
        </div>
        <ul id="task-list">
          {tasks.map((task, index) => (
            <li
              key={task.id}
              id={`task-${task.id}`}
              data-index={index}
              className="mb-2 p-2 bg-gray-100 rounded cursor-move"
            >
              {task.content}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
