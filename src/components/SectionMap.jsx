import { useEffect, useState } from 'react';
import { sectionSwatch, pastelize } from '../utils/palette.js';

// The map renders at its natural pixel size (never stretched to fill the
// page), so the font sizes set in index.css for its text are the sizes
// readers actually see. Below WIDE_MIN_VIEWPORT the wide layout would have
// to shrink to fit, so the stacked narrow layout takes over instead.
const WIDE = { width: 1100, height: 420, circleR: 150, boxW: 340, sideX: 30 };
const NARROW = { width: 320, circleR: 88, boxW: 300, gap: 18 };
const WIDE_MIN_VIEWPORT = 1180;

const TITLE_LINE_HEIGHT = 28;
const NODE_MIN_HEIGHT = 80;

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
  const height = Math.max(NODE_MIN_HEIGHT, 34 + (lines.length - 1) * TITLE_LINE_HEIGHT + 28 + 16);
  return { lines, height };
}

function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < WIDE_MIN_VIEWPORT,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${WIDE_MIN_VIEWPORT - 1}px)`);
    const onChange = (e) => setIsNarrow(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isNarrow;
}

function NodeContent({ x, y, width, lines, countText, swatch }) {
  const titleStartY = y + 34;
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
        y={titleStartY + (lines.length - 1) * TITLE_LINE_HEIGHT + 28}
        textAnchor="middle"
        fill={swatch.text}
        className="section-map-node-count"
      >
        {countText}
      </text>
    </>
  );
}

// Anchor point on a positioned node that a connector line should touch,
// per side: the middle of its inward-facing edge for left/right, the
// top-center for bottom.
function nodeAnchor(item) {
  const { x, y, height: h, side, width: w } = item;
  if (side === 'left') return { x: x + w, y: y + h / 2 };
  if (side === 'right') return { x, y: y + h / 2 };
  return { x: x + w / 2, y };
}

function nodeFarEdge(item) {
  const { x, y, height: h, side, width: w } = item;
  if (side === 'bottom') return { x: x + w / 2, y: y + h };
  return { x: x + w / 2, y: y + h / 2 };
}

function WideLayout({ list, activeSection, onSelect, counts }) {
  const { width, circleR, boxW, sideX } = WIDE;
  const rightX = width - sideX - boxW;
  const gap = 22;
  const topMargin = 30;
  const bottomGap = 40;

  // Round-robin sections across three positions so they "flow" around the
  // hub — right, left, bottom — one per side before doubling up on any.
  const rightItems = list.sections.filter((_, i) => i % 3 === 0);
  const leftItems = list.sections.filter((_, i) => i % 3 === 1);
  const bottomItems = list.sections.filter((_, i) => i % 3 === 2);

  function columnLayout(items, x, side, maxChars) {
    const laidOut = items.map((section) => ({ section, x, width: boxW, side, ...layoutNode(section, maxChars) }));
    const totalHeight = laidOut.reduce((sum, item) => sum + item.height, 0) + gap * (laidOut.length - 1);
    return { laidOut, totalHeight };
  }

  const right = columnLayout(rightItems, rightX, 'right', 26);
  const left = columnLayout(leftItems, sideX, 'left', 26);
  const bottom = columnLayout(bottomItems, width / 2 - boxW / 2, 'bottom', 26);

  const topHeight = Math.max(right.totalHeight, left.totalHeight, circleR * 2);
  const center = { x: width / 2, y: topMargin + topHeight / 2 };
  const height = bottomItems.length
    ? center.y + circleR + bottomGap + bottom.totalHeight + topMargin
    : center.y + topHeight / 2 + topMargin;

  function stackSide(laidOut, totalHeight, startY) {
    return laidOut.reduce((acc, item) => {
      const prevBottom = acc.length ? acc[acc.length - 1].y + acc[acc.length - 1].height + gap : startY;
      return [...acc, { ...item, y: prevBottom }];
    }, []);
  }

  const positioned = [
    ...stackSide(right.laidOut, right.totalHeight, center.y - right.totalHeight / 2),
    ...stackSide(left.laidOut, left.totalHeight, center.y - left.totalHeight / 2),
    ...stackSide(bottom.laidOut, bottom.totalHeight, center.y + circleR + bottomGap),
  ];

  function circleEdgePoint(targetX, targetY) {
    const dx = targetX - center.x;
    const dy = targetY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: center.x + (dx / dist) * circleR, y: center.y + (dy / dist) * circleR };
  }

  const titleLines = wrapText(list.title, 18).slice(0, 4);
  const lineHeight = 30;
  const titleStartY = center.y - ((titleLines.length - 1) * lineHeight) / 2;
  const hubSwatch = pastelize(list.accent);

  return (
    <svg
      className="section-map"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label="Browse by section"
    >
      {positioned.map((item, i) => {
        const anchor = nodeAnchor(item);
        const bottomChain = item.side === 'bottom' && i > 0 && positioned[i - 1].side === 'bottom';
        const from = bottomChain ? nodeFarEdge(positioned[i - 1]) : circleEdgePoint(anchor.x, anchor.y);
        return (
          <line key={`line-${item.section.id}`} className="section-map-line" x1={anchor.x} y1={anchor.y} x2={from.x} y2={from.y} />
        );
      })}
      {positioned.map((item, i) => {
        const anchor = nodeAnchor(item);
        const bottomChain = item.side === 'bottom' && i > 0 && positioned[i - 1].side === 'bottom';
        const from = bottomChain ? nodeFarEdge(positioned[i - 1]) : circleEdgePoint(anchor.x, anchor.y);
        return (
          <g key={`dots-${item.section.id}`}>
            <circle className="section-map-dot" cx={anchor.x} cy={anchor.y} r={4} />
            <circle className="section-map-dot" cx={from.x} cy={from.y} r={4} />
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
        <circle cx={center.x} cy={center.y} r={circleR} className="section-map-hub-circle" fill={hubSwatch.bg} />
        {titleLines.map((line, i) => (
          <text key={i} x={center.x} y={titleStartY + i * lineHeight} textAnchor="middle" fill={hubSwatch.text} className="section-map-hub-title">
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
  const hubCy = circleR + 12;
  const boxX = (width - boxW) / 2;

  const laidOut = list.sections.map((section) => ({ section, ...layoutNode(section, 22) }));
  const startY = hubCy + circleR + 34;
  const positioned = laidOut.reduce((acc, item) => {
    const y = acc.length ? acc[acc.length - 1].y + acc[acc.length - 1].height + gap : startY;
    return [...acc, { ...item, y }];
  }, []);
  const lastNode = positioned[positioned.length - 1];
  const height = (lastNode ? lastNode.y + lastNode.height : startY) + 20;

  const titleLines = wrapText(list.title, 12).slice(0, 4);
  const lineHeight = 26;
  const titleStartY = hubCy - ((titleLines.length - 1) * lineHeight) / 2;
  const hubSwatch = pastelize(list.accent);

  return (
    <svg
      className="section-map section-map-narrow"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label="Browse by section"
    >
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
        <circle cx={centerX} cy={hubCy} r={circleR} className="section-map-hub-circle" fill={hubSwatch.bg} />
        {titleLines.map((line, i) => (
          <text
            key={i}
            x={centerX}
            y={titleStartY + i * lineHeight}
            textAnchor="middle"
            fill={hubSwatch.text}
            className="section-map-hub-title section-map-hub-title-narrow"
          >
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
