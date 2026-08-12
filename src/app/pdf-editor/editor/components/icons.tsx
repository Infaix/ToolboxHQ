import type { ReactNode, SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function Svg({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Icons = {
  select: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 3l14 9-6 1.5L9 19.5 7.5 13 3 10.5 5 3z" />
    </Svg>
  ),
  edit: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 00-3-3L5 17l-1 3z" />
      <path d="M13.5 6.5l3 3" />
    </Svg>
  ),
  print: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 9V3h10v6" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </Svg>
  ),
  hand: (p: IconProps) => (
    <Svg {...p}>
      <path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-5.5a1.5 1.5 0 013 0V11m0-4a1.5 1.5 0 013 0V13m0-2.5a1.5 1.5 0 013 0V16a6 6 0 01-6 6h-1a6 6 0 01-5-2.6l-2.4-3.6a1.8 1.8 0 013-2L8 14V6.5" />
    </Svg>
  ),
  text: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 6V4h16v2M12 4v16m-3 0h6" />
    </Svg>
  ),
  highlight: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 20l1.5-4.5L15.5 5.5a2.1 2.1 0 013 3l-10 10L4 20z" />
      <path d="M13.5 7.5l3 3" />
    </Svg>
  ),
  underline: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 4v6a6 6 0 0012 0V4M4 20h16" />
    </Svg>
  ),
  strikethrough: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 5a3 3 0 013-3h6a3 3 0 013 3M5 12h14M8 16a3 3 0 003 3h2a3 3 0 003-3M6 19a3 3 0 003 3h6a3 3 0 003-3" />
    </Svg>
  ),
  draw: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 19l7-7a2.1 2.1 0 00-3-3l-7 7-1.5 4.5L12 19z" />
      <path d="M14.5 6.5l3 3" />
    </Svg>
  ),
  eraser: (p: IconProps) => (
    <Svg {...p}>
      <path d="M10.5 3.5l9.5 9.5-7 7a3 3 0 01-4.2 0L4 15.3a3 3 0 010-4.2l6.5-7.6z" />
      <path d="M6 18l-3 3h10" />
    </Svg>
  ),
  shapes: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="7" cy="7" r="3" />
      <rect x="12" y="12" width="8" height="8" />
      <path d="M19 4l2.5 5h-5L19 4z" />
    </Svg>
  ),
  line: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 20L20 4" />
    </Svg>
  ),
  arrow: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 20L17 7" />
      <path d="M17 7H9M17 7v8" />
    </Svg>
  ),
  image: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="M21 15l-5-5-9 9" />
    </Svg>
  ),
  signature: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 17c2.5-6 5-10 8-10 2.5 0 2 4 1 6s-2 4-3 1c-.7-2.4 1-5 4-6 3.5-1.2 6 1 8 4.5" />
      <path d="M4 21h17" />
    </Svg>
  ),
  note: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M9 12h6M9 16h4" />
    </Svg>
  ),
  form: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h6M7 13h6M7 17h10" />
    </Svg>
  ),
  redact: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="7" y="10" width="10" height="5" fill="currentColor" stroke="none" />
    </Svg>
  ),
  watermark: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v8m0 0c-2 0-3.5 1.5-3.5 3.5S10 18 12 18s3.5-1.5 3.5-3.5S14 11 12 11z" />
      <path d="M5 3v18M19 3v18" />
    </Svg>
  ),
  pageNumber: (p: IconProps) => (
    <Svg {...p}>
      <rect x="6" y="4" width="12" height="16" rx="1" />
      <path d="M10 2v4M14 2v4" />
    </Svg>
  ),
  headerFooter: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8h18M3 16h18M7 6h.01M11 6h.01" />
    </Svg>
  ),
  search: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </Svg>
  ),
  undo: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 010 12h-3" />
    </Svg>
  ),
  redo: (p: IconProps) => (
    <Svg {...p}>
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H10a6 6 0 000 12h3" />
    </Svg>
  ),
  zoomIn: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5M8 11h6M11 8v6" />
    </Svg>
  ),
  zoomOut: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5M8 11h6" />
    </Svg>
  ),
  fitWidth: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 9v6M21 9v6M7 13l2 2m0 0l2-2M9 15V8a2 2 0 012-2M17 11l-2-2m0 0l-2 2m2-2v7a2 2 0 01-2 2" />
    </Svg>
  ),
  fitPage: (p: IconProps) => (
    <Svg {...p}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
    </Svg>
  ),
  actualSize: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 3H4v3M17 3h3v3M7 21H4v-3M17 21h3v-3M4 9v6M20 9v6" />
    </Svg>
  ),
  fullscreen: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </Svg>
  ),
  fullscreenExit: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </Svg>
  ),
  download: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </Svg>
  ),
  open: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7V5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2M4 7a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2M4 7h16" />
    </Svg>
  ),
  pages: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="5" width="13" height="16" rx="1.5" />
      <path d="M8 3h10a2 2 0 012 2v13" />
    </Svg>
  ),
  trash: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13M10 11v6M14 11v6" />
    </Svg>
  ),
  duplicate: (p: IconProps) => (
    <Svg {...p}>
      <rect x="8" y="8" width="12" height="12" rx="1.5" />
      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
    </Svg>
  ),
  rotateCcw: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </Svg>
  ),
  rotateCw: (p: IconProps) => (
    <Svg {...p}>
      <path d="M21 12a9 9 0 11-9-9 9.75 9.75 0 016.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </Svg>
  ),
  close: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  ),
  plus: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  copy: (p: IconProps) => (
    <Svg {...p}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 012-2h10" />
    </Svg>
  ),
  chevronDown: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  ),
  chevronUp: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 15l6-6 6 6" />
    </Svg>
  ),
  lock: (p: IconProps) => (
    <Svg {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </Svg>
  ),
  privacy: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </Svg>
  ),
  file: (p: IconProps) => (
    <Svg {...p}>
      <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" />
      <path d="M14 3v6h6" />
    </Svg>
  ),
  warning: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3L2.5 19.5h19L12 3z" />
      <path d="M12 9v5M12 17h.01" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Svg>
  ),
  more: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  ),
  layers: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5M3 17l9 5 9-5" />
    </Svg>
  ),
  textField: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="7" width="16" height="11" rx="1" />
      <path d="M4 7l8 11M12 7l8 11" />
    </Svg>
  ),
  checkbox: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </Svg>
  ),
  radio: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </Svg>
  ),
  dropdown: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="7" width="16" height="11" rx="1" />
      <path d="M8 11h8M8 14.5h4" />
    </Svg>
  ),
  calendar: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </Svg>
  ),
  arrowUp: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Svg>
  ),
  arrowDown: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Svg>
  ),
  chevronLeft: (p: IconProps) => (
    <Svg {...p}>
      <path d="M15 6l-6 6 6 6" />
    </Svg>
  ),
  chevronRight: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  ),
  textAlignLeft: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 6h16M4 10h10M4 14h10M4 18h16" />
    </Svg>
  ),
  textAlignCenter: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 6h16M7 10h10M7 14h10M4 18h16" />
    </Svg>
  ),
  textAlignRight: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 6h16M10 10h10M10 14h10M4 18h16" />
    </Svg>
  ),
  italic: (p: IconProps) => (
    <Svg {...p}>
      <path d="M10 4h8M6 20h8M14 4L9 20" />
    </Svg>
  ),
  bold: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 4h6a4 4 0 010 8H7zM7 12h7a4 4 0 010 8H7z" />
    </Svg>
  ),
  spinner: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3a9 9 0 109 9" />
    </Svg>
  ),
};
