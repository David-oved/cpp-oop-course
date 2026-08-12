interface P {
  size?: number;
  className?: string;
}
const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IMenu = ({ size }: P) => (
  <svg {...base(size)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const ISparkle = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 15l.7 1.8L21.5 18l-1.8.7L19 21l-.7-2.3L16.5 18l1.8-.7L19 15z" />
  </svg>
);
export const IClose = ({ size }: P) => (
  <svg {...base(size)}><path d="M18 6L6 18M6 6l12 12" /></svg>
);
export const IPlay = ({ size }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none"><path d="M7 4.5v15l13-7.5z" /></svg>
);
export const ICopy = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h10" />
  </svg>
);
export const ICheck = ({ size }: P) => (
  <svg {...base(size)}><path d="M20 6L9 17l-5-5" /></svg>
);
export const IChevRight = ({ size }: P) => (
  <svg {...base(size)}><path d="M9 18l6-6-6-6" /></svg>
);
export const IChevLeft = ({ size }: P) => (
  <svg {...base(size)}><path d="M15 18l-6-6 6-6" /></svg>
);
export const ISettings = ({ size }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
export const ITerminal = ({ size }: P) => (
  <svg {...base(size)}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 9l3 3-3 3M13 15h5" />
  </svg>
);
export const IHome = ({ size }: P) => (
  <svg {...base(size)}><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>
);
export const ISun = ({ size }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const IMoon = ({ size }: P) => (
  <svg {...base(size)}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>
);
export const ISend = ({ size }: P) => (
  <svg {...base(size)}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
);
export const IReset = ({ size }: P) => (
  <svg {...base(size)}><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" /><path d="M3 3v5h5" /></svg>
);
export const ISave = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </svg>
);
export const ITrash = ({ size }: P) => (
  <svg {...base(size)}><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
);
export const IBulb = ({ size }: P) => (
  <svg {...base(size)}>
    <path d="M9 18h6M10 22h4" />
    <path d="M15.1 14a5 5 0 10-6.2 0c.6.5 1.1 1.2 1.1 2h4c0-.8.5-1.5 1.1-2z" />
  </svg>
);
export const IEye = ({ size }: P) => (
  <svg {...base(size)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const ISearch = ({ size }: P) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const IBook = ({ size }: P) => (
  <svg {...base(size)}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
);
export const IArrowRight = ({ size }: P) => (
  <svg {...base(size)}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);
export const IStack = ({ size }: P) => (
  <svg {...base(size)}><path d="M12 2l10 6-10 6L2 8z" /><path d="M2 12l10 6 10-6M2 16l10 6 10-6" /></svg>
);
