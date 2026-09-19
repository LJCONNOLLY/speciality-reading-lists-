import { useEffect, useState } from 'react';
import { paletteSwatch } from '../utils/palette.js';

const WIDE = { width: 800, height: 420, circleR: 100, boxW: 240, boxH: 60, sideX: 24 };
const NARROW = { width: 360, height: 0, circleR: 66, boxW: 300, boxH: 56, gap: 18 };

function wrapText(text, maxCharsPerLine) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
  );
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const onChange = (e) => setIsNarrow(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isNarrow;
}

function WideLayout({ list, activeSection, onSelect, counts }) {
  const { width, height, circleR, boxW, boxH, sideX } = WIDE;
  const center = { x: width / 2, y: height / 2 };
  const rightX = width - sideX - boxW;

  const rightItems = list.sections.filter((_, i) => i % 2 === 0);
  const leftItems = list.sections.filter((_, i) => i % 2 === 1);

  function columnLayout(items, x) {
    const gap = 22;
    const totalHeight = items.length * boxH + (items.length - 1) * gap;
    const startY = (height - totalHeight) / 2;
    return items.map((item, i) => ({ section: item, x, y: startY + i * (boxH + gap) }));
  }

  const positioned = [
    ...columnLayout(rightItems, rightX).map((p) => ({ ...p, side: 'right' })),
    ...columnLayout(leftItems, sideX).map((p) => ({ ...p, side: 'left' })),
  ];

  function circleEdgePoint(targetX, targetY) {
    const dx = targetX - center.x;
    const dy = targetY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: center.x + (dx / dist) * circleR, y: center.y + (dy / dist) * circleR };
  }

  const titleLines = wrapText(list.title, 15).slice(0, 4);
  const lineHeight = 19;
  const titleStartY = center.y - ((titleLines.length - 1) * lineHeight) / 2;

  return (
    <svg className="section-map" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Browse by section">
      {positioned.map(({ section, x, y, side }) => {
        const anchor = side === 'left' ? { x: x + boxW, y: y + boxH / 2 } : { x, y: y + boxH / 2 };
        const edge = circleEdgePoint(anchor.x, anchor.y);
        return (
          <line key={`line-${section.id}`} className="section-map-line" x1={anchor.x} y1={anchor.y} x2={edge.x} y2={edge.y} />
        );
      })}
      {positioned.map(({ section, x, y, side }) => {
        const anchor = side === 'left' ? { x: x + boxW, y: y + boxH / 2 } : { x, y: y + boxH / 2 };
        const edge = circleEdgePoint(anchor.x, anchor.y);
        return (
          <g key={`dots-${section.id}`}>
            <circle className="section-map-dot" cx={anchor.x} cy={anchor.y} r={4} />
            <circle className="section-map-dot" cx={edge.x} cy={edge.y} r={4} />
          </g>
        );
      })}
      {positioned.map(({ section, x, y }) => {
        const originalIndex = list.sections.findIndex((s) => s.id === section.id);
        const swatch = paletteSwatch(originalIndex);
        const isActive = activeSection === section.id;
        return (
          <g
            key={section.id}
            className={`section-map-node${isActive ? ' active' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            aria-label={`Show ${section.title} (${counts[section.id] || 0} texts)`}
            onClick={() => onSelect(section.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(section.id);
              }
            }}
          >
            <rect x={x} y={y} width={boxW} height={boxH} rx={14} fill={swatch.bg} stroke={isActive ? 'var(--ink)' : 'transparent'} strokeWidth={isActive ? 3 : 0} />
            <text x={x + boxW / 2} y={y + boxH / 2 - 4} textAnchor="middle" fill={swatch.text} className="section-map-node-title">
              {section.title}
            </text>
            <text x={x + boxW / 2} y={y + boxH / 2 + 15} textAnchor="middle" fill={swatch.text} className="section-map-node-count">
              {counts[section.id] || 0} texts
            </text>
          </g>
        );
      })}
      <g
        className={`section-map-hub${activeSection === 'all' ? ' active' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={activeSection === 'all'}
        aria-label={`Show all ${counts.all} texts`}
        onClick={() => onSelect('all')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect('all');
          }
        }}
      >
        <circle cx={center.x} cy={center.y} r={circleR} className="section-map-hub-circle" />
        {titleLines.map((line, i) => (
          <text key={i} x={center.x} y={titleStartY + i * lineHeight} textAnchor="middle" className="section-map-hub-title">
            {line}
          </text>
        ))}
      </g>
    </svg>
  );
}

function NarrowLayout({ list, activeSection, onSelect, counts }) {
  const { width, circleR, boxW, boxH, gap } = NARROW;
  const centerX = width / 2;
  const hubCy = 78;
  const firstBoxY = hubCy + circleR + 34;
  const height = firstBoxY + list.sections.length * (boxH + gap);
  const boxX = (width - boxW) / 2;

  const titleLines = wrapText(list.title, 12).slice(0, 4);
  const lineHeight = 16;
  const titleStartY = hubCy - ((titleLines.length - 1) * lineHeight) / 2;

  return (
    <svg className="section-map section-map-narrow" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Browse by section">
      {list.sections.map((section, i) => {
        const y = firstBoxY + i * (boxH + gap);
        const prevBottom = i === 0 ? hubCy + circleR : firstBoxY + (i - 1) * (boxH + gap) + boxH;
        return (
          <g key={`line-${section.id}`}>
            <line className="section-map-line" x1={centerX} y1={prevBottom} x2={centerX} y2={y} />
            <circle className="section-map-dot" cx={centerX} cy={prevBottom} r={4} />
            <circle className="section-map-dot" cx={centerX} cy={y} r={4} />
          </g>
        );
      })}
      {list.sections.map((section, i) => {
        const y = firstBoxY + i * (boxH + gap);
        const swatch = paletteSwatch(i);
        const isActive = activeSection === section.id;
        return (
          <g
            key={section.id}
            className={`section-map-node${isActive ? ' active' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            aria-label={`Show ${section.title} (${counts[section.id] || 0} texts)`}
            onClick={() => onSelect(section.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(section.id);
              }
            }}
          >
            <rect x={boxX} y={y} width={boxW} height={boxH} rx={14} fill={swatch.bg} stroke={isActive ? 'var(--ink)' : 'transparent'} strokeWidth={isActive ? 3 : 0} />
            <text x={centerX} y={y + boxH / 2 - 4} textAnchor="middle" fill={swatch.text} className="section-map-node-title">
              {section.title}
            </text>
            <text x={centerX} y={y + boxH / 2 + 15} textAnchor="middle" fill={swatch.text} className="section-map-node-count">
              {counts[section.id] || 0} texts
            </text>
          </g>
        );
      })}
      <g
        className={`section-map-hub${activeSection === 'all' ? ' active' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={activeSection === 'all'}
        aria-label={`Show all ${counts.all} texts`}
        onClick={() => onSelect('all')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect('all');
          }
        }}
      >
        <circle cx={centerX} cy={hubCy} r={circleR} className="section-map-hub-circle" />
        {titleLines.map((line, i) => (
          <text key={i} x={centerX} y={titleStartY + i * lineHeight} textAnchor="middle" className="section-map-hub-title section-map-hub-title-narrow">
            {line}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default function SectionMap(props) {
  const isNarrow = useIsNarrow();
  return isNarrow ? <NarrowLayout {...props} /> : <WideLayout {...props} />;
}
