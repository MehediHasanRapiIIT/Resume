// Runs the Connect-4 search off the main thread so animations never stutter while it thinks.
import { bestMove, type Board } from './connect4';

export interface MoveRequest {
  game: number;
  board: Board;
  depth: number;
}

export interface MoveReply {
  game: number;
  col: number;
}

self.onmessage = (e: MessageEvent<MoveRequest>) => {
  const { game, board, depth } = e.data;
  const reply: MoveReply = { game, col: bestMove(board, depth) };
  self.postMessage(reply);
};
