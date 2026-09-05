import { useState } from 'react';

const commands = [
  {
    category: 'Open/Close',
    icon: '💻',
    colorClass: 'icon-blue',
    items: [
      { cmd: 'open <app>', desc: 'Launches an application' },
      { cmd: 'close <app>', desc: 'Force quits an application' }
    ]
  },
  {
    category: 'Search File',
    icon: '🔍',
    colorClass: 'icon-purple',
    items: [
      { cmd: 'search folder <name>', desc: 'Finds and opens a folder' },
      { cmd: 'search <type> <name>', desc: 'Finds a specific file type' }
    ]
  },
  {
    category: 'Volume',
    icon: '🔊',
    colorClass: 'icon-green',
    items: [
      { cmd: 'volume up/down', desc: 'Adjusts system volume' },
      { cmd: 'mute/unmute', desc: 'Toggles system audio' }
    ]
  },
  {
    category: 'Brightness',
    icon: '☀️',
    colorClass: 'icon-yellow',
    items: [
      { cmd: 'brightness up/down', desc: 'Adjusts screen brightness' }
    ]
  }
];

export default function GuidePanel() {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div className="guide-panel">
      <div className="guide-header">
        <div className="guide-title">Guide & Help</div>
        <div className="guide-subtitle">Available Commands</div>
      </div>
      <div className="guide-body">
        {commands.map((group, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={group.category} className={`guide-section ${isExpanded ? 'expanded' : ''}`}>
              <div 
                className="guide-section-header" 
                onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
              >
                <div className={`guide-icon ${group.colorClass}`}>{group.icon}</div>
                <div className="guide-section-title">{group.category}</div>
                <div className="guide-chevron">▼</div>
              </div>
              {isExpanded && (
                <div className="guide-commands">
                  {group.items.map((item, i) => (
                    <div key={i} className="cmd-example">
                      <div className="cmd-tag">{item.cmd}</div>
                      <div className="cmd-desc">{item.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
