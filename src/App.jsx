
import { useState } from 'react';
import './App.css';


const easyBoard = [
  [5, 3, '', '', 7, '', '', '', ''],
  [6, '', '', 1, 9, 5, '', '', ''],
  ['', 9, 8, '', '', '', '', 6, ''],
  [8, '', '', '', 6, '', '', '', 3],
  [4, '', '', 8, '', 3, '', '', 1],
  [7, '', '', '', 2, '', '', '', 6],
  ['', 6, '', '', '', '', 2, 8, ''],
  ['', '', '', 4, 1, 9, '', '', 5],
  ['', '', '', '', 8, '', '', 7, 9],
];

const mediumBoard = [
  ['', '', '', 2, 6, '', 7, '', 1],
  [6, 8, '', '', 7, '', '', 9, ''],
  [1, 9, '', '', '', 4, 5, '', ''],
  [8, 2, '', 1, '', '', '', 4, ''],
  ['', '', 4, 6, '', 2, 9, '', ''],
  ['', 5, '', '', '', 3, '', 2, 8],
  ['', '', 9, 3, '', '', '', 7, 4],
  ['', 4, '', '', 5, '', '', 3, 6],
  [7, '', 3, '', 1, 8, '', '', ''],
];

const hardBoard = [
  ['', '', '', '', '', '', '', '', ''],
  [6, '', '', '', '', '', '', '', ''],
  ['', '', 1, '', 9, 5, '', '', ''],
  ['', 9, 8, '', '', '', '', 6, ''],
  [8, '', '', '', 6, '', '', '', 3],
  [4, '', '', 8, '', 3, '', '', 1],
  [7, '', '', '', 2, '', '', '', 6],
  ['', 6, '', '', '', '', 2, 8, ''],
  ['', '', '', 4, 1, 9, '', '', 5],
];

const defaultBoard = easyBoard;

// Simple randomizer: shuffle rows/columns of the default board for demo purposes
function shuffleBoard(board) {
  const newBoard = board.map(row => [...row]);
  // Shuffle rows within each 3-row block
  for (let block = 0; block < 3; block++) {
    const rows = [0, 1, 2].map(i => block * 3 + i);
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newBoard[rows[i]], newBoard[rows[j]]] = [newBoard[rows[j]], newBoard[rows[i]]];
    }
  }
  // Shuffle columns within each 3-col block
  for (let block = 0; block < 3; block++) {
    const cols = [0, 1, 2].map(i => block * 3 + i);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      for (let row = 0; row < 9; row++) {
        [newBoard[row][cols[i]], newBoard[row][cols[j]]] = [newBoard[row][cols[j]], newBoard[row][cols[i]]];
      }
    }
  }
  return newBoard;
}

function isValid(board, row, col, value) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] == value || board[i][col] == value) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] == value) return false;
    }
  }
  return true;
}

// Helper to solve the board (backtracking)
function solveSudoku(board) {
  const b = board.map(row => row.map(cell => (cell === '' ? 0 : cell)));
  function isSafe(r, c, n) {
    for (let i = 0; i < 9; i++) {
      if (b[r][i] === n || b[i][c] === n) return false;
    }
    const sr = Math.floor(r / 3) * 3;
    const sc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (b[sr + i][sc + j] === n) return false;
      }
    }
    return true;
  }
  function solve() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] === 0) {
          for (let n = 1; n <= 9; n++) {
            if (isSafe(r, c, n)) {
              b[r][c] = n;
              if (solve()) return true;
              b[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  solve();
  return b;
}


function App() {
  const [initialBoard, setInitialBoard] = useState(defaultBoard);
  const [board, setBoard] = useState(defaultBoard);
  const [message, setMessage] = useState('');
  const [hintCell, setHintCell] = useState(null); // {row, col}
  const [level, setLevel] = useState('Easy');

  const handleChange = (row, col, val) => {
    if (val === '' || (/^[1-9]$/.test(val) && isValid(board, row, col, Number(val)))) {
      const newBoard = board.map((r, i) =>
        r.map((c, j) => (i === row && j === col ? val === '' ? '' : Number(val) : c))
      );
      setBoard(newBoard);
      setMessage('');
    } else {
      setMessage('Invalid move!');
    }
  };

  const handleNewSudoku = (difficulty) => {
    let baseBoard = defaultBoard;
    let label = 'Easy'
    if (difficulty === 'easy') {
      baseBoard = easyBoard;
      label = 'Easy';
    } else if (difficulty === 'medium') {
      baseBoard = mediumBoard;
      label = 'Medium';
    } else if (difficulty === 'hard') {
      baseBoard = hardBoard;
      label = 'Hard';
    }
    const newInit = shuffleBoard(baseBoard);
    setInitialBoard(newInit);
    setBoard(newInit.map(row => row.map(cell => (typeof cell === 'number' ? cell : ''))));
    setMessage('');
    setHintCell(null);
    setLevel(label);
  };

  const handleHint = () => {
    // Find all empty cells
    const empties = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (initialBoard[i][j] === '' && (board[i][j] === '' || board[i][j] === undefined)) {
          empties.push([i, j]);
        }
      }
    }
    if (empties.length === 0) return;
    const [row, col] = empties[Math.floor(Math.random() * empties.length)];
    const solved = solveSudoku(initialBoard);
    const value = solved[row][col];
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);
    setHintCell({ row, col });
    setTimeout(() => setHintCell(null), 6000);
  };

  const isComplete = board.every(row => row.every(cell => cell !== ''));

  return (
    <div className="sudoku-app">
      <h1>Sudoku</h1>
      <div style={{ marginBottom: '0.5em', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em' }}>
        Level: <span data-testid="sudoku-level-label">{level}</span>
      </div>
      <div style={{ marginBottom: '1em', display: 'flex', gap: '0.5em', justifyContent: 'center' }}>
        <button type="button" onClick={() => handleNewSudoku('easy')}>New Easy</button>
        <button type="button" onClick={() => handleNewSudoku('medium')}>New Medium</button>
        <button type="button" onClick={() => handleNewSudoku('hard')}>New Hard</button>
      </div>
      <div className="sudoku-board">
        {board.map((row, i) => (
          <div className="sudoku-row" key={i}>
            {row.map((cell, j) => {
              const blockRight = (j + 1) % 3 === 0 && j !== 8;
              const blockBottom = (i + 1) % 3 === 0 && i !== 8;
              let cellClass = 'sudoku-cell';
              if (blockRight) cellClass += ' block-right';
              if (blockBottom) cellClass += ' block-bottom';
              if (hintCell && hintCell.row === i && hintCell.col === j) cellClass += ' sudoku-hint';
              return (
                <input
                  key={j}
                  className={cellClass}
                  type="text"
                  maxLength={1}
                  value={cell}
                  onChange={e => handleChange(i, j, e.target.value)}
                  disabled={initialBoard[i][j] !== ''}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ margin: '1em 0', textAlign: 'center' }}>
        <button type="button" onClick={handleHint}>Get Hint</button>
      </div>
      <div className="sudoku-message">{message || (isComplete ? 'Congratulations! Puzzle complete.' : '')}</div>
      <div className="sudoku-instructions">
        <p>Fill the grid so that every row, column, and 3x3 box contains the numbers 1-9.</p>
      </div>
    </div>
  );
}

export default App;
