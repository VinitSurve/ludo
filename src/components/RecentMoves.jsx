import React from 'react';
import { History, Swords, Star, Trophy, RotateCcw, ArrowRight, Zap } from 'lucide-react';

export function RecentMoves({ history = [] }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'CAPTURE':
        return <Swords size={14} className="text-red-500" />;
      case 'FINISH':
        return <Star size={14} className="text-yellow-500" />;
      case 'WIN':
        return <Trophy size={14} className="text-green-500" />;
      case 'UNDO':
        return <RotateCcw size={14} className="text-blue-500" />;
      case 'AUTO_MOVE':
        return <Zap size={14} className="text-amber-500" />;
      default:
        return <ArrowRight size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="recent-moves-card">
      <div className="recent-moves-header">
        <h3>
          <History size={16} />
          <span>Game History</span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
          {history.length} events
        </span>
      </div>

      <div className="recent-moves-list">
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '0.85rem' }}>
            No moves yet. Roll the dice to start!
          </div>
        ) : (
          history.map((event) => (
            <div key={event.id} className={`history-item type-${event.type}`}>
              {getEventIcon(event.type)}
              <span>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
