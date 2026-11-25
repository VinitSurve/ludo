import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';

// Mock Web Audio API
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }
  resume() { return Promise.resolve(); }
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
}

window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;

describe('App Full Integration Tests', () => {
  it('renders the complete application header, board, scoreboard, and dice without crashing', () => {
    render(<App />);

    // Check Header & Logo
    expect(screen.getByText('LUDO MASTER')).toBeInTheDocument();
    expect(screen.getByText('4 Players')).toBeInTheDocument();

    // Check Player Cards
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Player 4')).toBeInTheDocument();

    // Check Dice & Controls
    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
    expect(screen.getByText('Scoreboard (4P)')).toBeInTheDocument();
  });

  it('allows manual score adjustments for players', () => {
    render(<App />);

    const addButtons = screen.getAllByLabelText('Add 1 point');
    expect(addButtons.length).toBe(4);

    // Click +1 on Player 1
    fireEvent.click(addButtons[0]);
    // Click +1 again
    fireEvent.click(addButtons[0]);

    // Check that score displays 2
    expect(screen.getAllByText('Score:')[0].parentElement).toHaveTextContent('2');

    // Click -1
    const minusButtons = screen.getAllByLabelText('Subtract 1 point');
    fireEvent.click(minusButtons[0]);
    expect(screen.getAllByText('Score:')[0].parentElement).toHaveTextContent('1');
  });

  it('opens and closes the Rules modal', () => {
    render(<App />);

    const rulesBtn = screen.getByLabelText('Game Rules');
    fireEvent.click(rulesBtn);

    expect(screen.getByText('Official Ludo Rules')).toBeInTheDocument();

    const gotItBtn = screen.getByText('Got It!');
    fireEvent.click(gotItBtn);

    expect(screen.queryByText('Official Ludo Rules')).not.toBeInTheDocument();
  });

  it('opens New Game setup modal and switches to 6 players mode', () => {
    render(<App />);

    const newGameBtn = screen.getByText('New Game');
    fireEvent.click(newGameBtn);

    expect(screen.getByText('New Game Setup')).toBeInTheDocument();

    // Click on 6 players selector
    const sixBtn = screen.getByRole('button', { name: '6' });
    fireEvent.click(sixBtn);

    expect(screen.getByText(/Extended 6-Sector Hexagonal Board/i)).toBeInTheDocument();

    // Click Start Game
    const startBtn = screen.getByRole('button', { name: /Start Game/i });
    fireEvent.click(startBtn);

    // Verify 6 players are now rendered
    expect(screen.getByText('Scoreboard (6P)')).toBeInTheDocument();
    expect(screen.getByText('Player 5')).toBeInTheDocument();
    expect(screen.getByText('Player 6')).toBeInTheDocument();
    // In 6-player mode, all sectors are active so INACTIVE badge is not shown
    expect(screen.queryByText('INACTIVE')).not.toBeInTheDocument();
  });

  it('switches to 5 players Extended mode and renders Sector 6 as INACTIVE', () => {
    render(<App />);

    const newGameBtn = screen.getByText('New Game');
    fireEvent.click(newGameBtn);

    // Click on 5 players selector
    const fiveBtn = screen.getByRole('button', { name: '5' });
    fireEvent.click(fiveBtn);

    expect(screen.getByText(/Extended 6-Sector Hexagonal Board/i)).toBeInTheDocument();

    // Click Start Game
    const startBtn = screen.getByRole('button', { name: /Start Game/i });
    fireEvent.click(startBtn);

    // Verify 5 players are rendered
    expect(screen.getByText('Scoreboard (5P)')).toBeInTheDocument();
    expect(screen.getByText('Player 5')).toBeInTheDocument();
    expect(screen.queryByText('Player 6')).not.toBeInTheDocument();

    // In 5-player mode, the 6th sector base must render 'INACTIVE' label
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('allows dev dice roll to automatically bring a pawn out of base onto track', async () => {
    render(<App />);

    // Toggle Dev Dice Simulator
    const devToggle = screen.getByText('Show');
    fireEvent.click(devToggle);

    // Click '6' in dev simulator
    const devSixBtn = screen.getByTitle('Force roll 6');
    fireEvent.click(devSixBtn);

    // Wait for roll animation timeout (280ms)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });

    // Player 1 rolled 6, and only one legal action exists (bringing pawn from base) -> auto-move executes!
    expect(screen.getByRole('heading', { name: /Rolled a 6/i })).toBeInTheDocument();
  });

  it('renders movement speed configuration in settings modal', () => {
    render(<App />);

    // Open settings modal
    const settingsBtn = screen.getAllByLabelText('Settings')[0];
    fireEvent.click(settingsBtn);

    expect(screen.getByText('Pawn Movement Speed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Normal \(Default\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Slow \(350ms\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fast \(190ms\)/i })).toBeInTheDocument();

    // Select Slow speed
    const slowBtn = screen.getByRole('button', { name: /Slow \(350ms\)/i });
    fireEvent.click(slowBtn);

    // Close modal
    const doneBtn = screen.getByText('Done');
    fireEvent.click(doneBtn);
    expect(screen.queryByText('Pawn Movement Speed')).not.toBeInTheDocument();
  });
});
