"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const SIZE = 4;
const TILE_COLORS: Record<number, string> = {
  0: "bg-muted",
  2: "bg-yellow-200",
  4: "bg-yellow-300",
  8: "bg-orange-200",
  16: "bg-orange-300",
  32: "bg-orange-400",
  64: "bg-orange-500",
  128: "bg-orange-600",
  256: "bg-orange-700",
  512: "bg-orange-800",
  1024: "bg-orange-900",
  2048: "bg-red-500",
};

function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(board: number[][]): number[][] {
  const empty: [number, number][] = [];
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) empty.push([r, c]);
    })
  );
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map((row) => row.slice());
  newBoard[r][c] = value;
  return newBoard;
}

function compress(row: number[]): number[] {
  const newRow = row.filter((v) => v !== 0);
  while (newRow.length < SIZE) newRow.push(0);
  return newRow;
}

function merge(row: number[]): number[] {
  for (let i = 0; i < SIZE - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
    }
  }
  return row;
}

function moveLeft(board: number[][]): number[][] {
  return board.map((row) => merge(compress(row)));
}

function reverse(board: number[][]): number[][] {
  return board.map((row) => row.slice().reverse());
}

function transpose(board: number[][]): number[][] {
  const newBoard: number[][] = emptyBoard();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newBoard[c][r] = board[r][c];
    }
  }
  return newBoard;
}

function move(board: number[][], direction: "up" | "down" | "left" | "right"): number[][] {
  let newBoard = board;
  switch (direction) {
    case "up":
      newBoard = transpose(newBoard);
      newBoard = moveLeft(newBoard);
      newBoard = transpose(newBoard);
      break;
    case "down":
      newBoard = transpose(newBoard);
      newBoard = reverse(newBoard);
      newBoard = moveLeft(newBoard);
      newBoard = reverse(newBoard);
      newBoard = transpose(newBoard);
      break;
    case "left":
      newBoard = moveLeft(newBoard);
      break;
    case "right":
      newBoard = reverse(newBoard);
      newBoard = moveLeft(newBoard);
      newBoard = reverse(newBoard);
      break;
  }
  return newBoard;
}

function hasMoves(board: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export default function Game2048() {
  const [board, setBoard] = useState<number[][]>(emptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let b = emptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
  }, []);

  useEffect(() => {
    const newScore = board.flat().reduce((a, v) => a + v, 0);
    setScore(newScore);
    if (!hasMoves(board)) setGameOver(true);
  }, [board]);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    const newBoard = move(board, dir);
    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      const updated = addRandomTile(newBoard);
      setBoard(updated);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((value, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-20 rounded-md text-2xl font-bold ${TILE_COLORS[value]}`}
          >
            {value !== 0 ? value : null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handleMove("up")}>
          <ArrowUp />
        </Button>
        <Button variant="outline" onClick={() => handleMove("left")}>
          <ArrowLeft />
        </Button>
        <Button variant="outline" onClick={() => handleMove("right")}>
          <ArrowRight />
        </Button>
        <Button variant="outline" onClick={() => handleMove("down")}>
          <ArrowDown />
        </Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <Share text={`I scored ${score} in 2048! ${url}`} />
      )}
    </div>
  );
}
