import { useEffect, useState } from 'react';
import { sectionSwatch } from '../utils/palette.js';

const WIDE = { width: 800, height: 420, circleR: 100, boxW: 240, sideX: 24 };
const NARROW = { width: 360, circleR: 66, boxW: 300, gap: 18 };

const TITLE_LINE_HEIGHT = 20;
const NODE_MIN_HEIGHT = 60;

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

// A spoke box's title can be arbitrarily long, so its height has to grow
// with however many lines that title wraps to (never fixed) — otherwise
// longer titles just overflow their box.
function layoutNode(section, maxCharsPerLine) {
  const lines = wrapText(section.title, maxCharsPerLine).slice(0, 3);
  const height = Math.max(NODE_MIN_HEIGHT, 26 + (lines.length - 1) * TITLE_LINE_HEIGHT + 24 + 14);
  return { lines, height };
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

function NodeContent({ x, y, width, lines, countText, swatch }) {
  const titleStartY = y + 26;
  return (
    <>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + width / 2}
          y={titleStartY + i * TITLE_LINE_HEIGHT}
          textAnchor="middle"
          fill={swatch.text}
          className="section-map-node-title"
        >
          {line}
        </text>
      ))}
      <text
        x={x + width / 2}
        y={titleStartY + (lines.length - 1) * TITLE_LINE_HEIGHT + 22}
        textAnchor="middle"
        fill={swatch.text}
        className="section-map-node-count"
      >
        {countText}
      </text>
    </>
  );
}

function WideLayout({ list, activeSection, onSelect, counts }) {
  const { width, circleR, boxW, sideX } = WIDE;
  const rightX = width - sideX - boxW;
  const gap = 22;

  const rightItems = list.sections.filter((_, i) => i % 2 === 0);
  const leftItems = list.sections.filter((_, i) => i % 2 === 1);

  function columnLayout(items, x) {
    const laidOut = items.map((section) => ({ section, x, ...layoutNode(section, 20) }));
    const totalHeight = laidOut.reduce((sum, item) => sum + item.height, 0) + gap * (laidOut.length - 1);
    return { laidOut, totalHeight };
  }

  const right = columnLayout(rightItems, rightX);
  const left = columnLayout(leftItems, sideX);
  const height = Math.max(WIDE.height, right.totalHeight + 60, left.totalHeight + 60);
  const center = { x: width / 2, y: height / 2 };

  function stack(laidOut, totalHeight, side) {
    const startY = center.y - totalHeight / 2;
    return laidOut.reduce((acc, item) => {
      const prevBottom = acc.length ? acc[acc.length - 1].y + acc[acc.length - 1].height + gap : startY;
      return [...acc, { ...item, y: prevBottom, side }];
    }, []);
  }

  const positioned = [...stack(right.laidOut, right.totalHeight, 'right'), ...stack(left.laidOut, left.totalHeight, 'left')];

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
      {positioned.map(({ section, x, y, height: h, side }) => {
        const anchor = side === 'left' ? { x: x + boxW, y: y + h / 2 } : { x, y: y + h / 2 };
        const edge = circleEdgePoint(anchor.x, anchor.y);
        return (
          <line key={`line-${section.id}`} className="section-map-line" x1={anchor.x} y1={anchor.y} x2={edge.x} y2={edge.y} />
        );
      })}
      {positioned.map(({ section, x, y, height: h, side }) => {
        const anchor = side === 'left' ? { x: x + boxW, y: y + h / 2 } : { x, y: y + h / 2 };
        const edge = circleEdgePoint(anchor.x, anchor.y);
        return (
          <g key={`dots-${section.id}`}>
            <circle className="section-map-dot" cx={anchor.x} cy={anchor.y} r={4} />
            <circle className="section-map-dot" cx={edge.x} cy={edge.y} r={4} />
          </g>
        );
      })}
      {positioned.map(({ section, x, y, height: h, lines }) => {
        const originalIndex = list.sections.findIndex((s) => s.id === section.id);
        const swatch = sectionSwatch(section, originalIndex);
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
            <rect x={x} y={y} width={boxW} height={h} rx={14} fill={swatch.bg} stroke={isActive ? 'var(--ink)' : 'transparent'} strokeWidth={isActive ? 3 : 0} />
            <NodeContent x={x} y={y} width={boxW} lines={lines} countText={`${counts[section.id] || 0} texts`} swatch={swatch} />
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
  const { width, circleR, boxW, gap } = NARROW;
  const centerX = width / 2;
  const hubCy = 78;
  const boxX = (width - boxW) / 2;

  const laidOut = list.sections.map((section) => ({ section, ...layoutNode(section, 24) }));
  const startY = hubCy + circleR + 34;
  const positioned = laidOut.reduce((acc, item) => {
    const y = acc.length ? acc[acc.length - 1].y + acc[acc.length - 1].height + gap : startY;
    return [...acc, { ...item, y }];
  }, []);
  const lastNode = positioned[positioned.length - 1];
  const height = (lastNode ? lastNode.y + lastNode.height : startY) + 20;

  const titleLines = wrapText(list.title, 12).slice(0, 4);
  const lineHeight = 16;
  const titleStartY = hubCy - ((titleLines.length - 1) * lineHeight) / 2;

  return (
    <svg className="section-map section-map-narrow" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Browse by section">
      {positioned.map(({ section, y }, i) => {
        const prevBottom = i === 0 ? hubCy + circleR : positioned[i - 1].y + positioned[i - 1].height;
        return (
          <g key={`line-${section.id}`}>
            <line className="section-map-line" x1={centerX} y1={prevBottom} x2={centerX} y2={y} />
            <circle className="section-map-dot" cx={centerX} cy={prevBottom} r={4} />
            <circle className="section-map-dot" cx={centerX} cy={y} r={4} />
          </g>
        );
      })}
      {positioned.map(({ section, y, height: h, lines }, i) => {
        const swatch = sectionSwatch(section, i);
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
            <rect x={boxX} y={y} width={boxW} height={h} rx={14} fill={swatch.bg} stroke={isActive ? 'var(--ink)' : 'transparent'} strokeWidth={isActive ? 3 : 0} />
            <NodeContent x={boxX} y={y} width={boxW} lines={lines} countText={`${counts[section.id] || 0} texts`} swatch={swatch} />
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
