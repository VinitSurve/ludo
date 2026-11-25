import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Piece } from '../src/components/Piece';

describe('3D Ludo Pawn Component Tests', () => {
  const mockPiece = {
    id: 0,
    colorKey: 'red',
    state: 'TRACK',
    step: 5,
  };

  it('renders realistic 3D pawn SVG with head, neck, body, base, and shadow', () => {
    const { container } = render(<Piece piece={mockPiece} isLegal={false} />);

    const svg = container.querySelector('svg.pawn-svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 44 60');

    // Verify pawn structural elements: spherical head circle, base ellipses, body paths
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(1); // Head circle

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(3); // Base, Body, and gloss highlight paths

    const groundShadow = container.querySelector('ellipse[fill="rgba(15,23,42,0.28)"]');
    expect(groundShadow).toBeInTheDocument();
  });

  it('applies selectable glowing pulse class when pawn is legal to move', () => {
    const { container } = render(<Piece piece={mockPiece} isLegal={true} />);

    const wrapper = container.querySelector('.pawn-wrapper');
    expect(wrapper).toHaveClass('pawn-selectable');
  });

  it('triggers onClick handler when legal pawn is clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Piece piece={mockPiece} isLegal={true} onClick={handleClick} />
    );

    const wrapper = container.querySelector('.pawn-wrapper');
    fireEvent.click(wrapper);
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('does NOT trigger onClick handler when pawn is not legal to move', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Piece piece={mockPiece} isLegal={false} onClick={handleClick} />
    );

    const wrapper = container.querySelector('.pawn-wrapper');
    fireEvent.click(wrapper);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders stack count badge when multiple pawns occupy the same cell', () => {
    render(<Piece piece={mockPiece} isLegal={false} stackCount={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('triggers springy jumping animation (pawn-jumping class) when pawn step updates', () => {
    const { container, rerender } = render(<Piece piece={{ ...mockPiece, step: 5 }} isLegal={false} />);

    const wrapper = container.querySelector('.pawn-wrapper');
    expect(wrapper).not.toHaveClass('pawn-jumping');

    // Update piece step (moves to step 9)
    rerender(<Piece piece={{ ...mockPiece, step: 9 }} isLegal={false} />);
    expect(wrapper).toHaveClass('pawn-jumping');
  });
});
