export function Icon({ name, size = 20 }: {
  name: "play" | "pause" | "volume" | "settings" | "timer" | "location" | "fullscreen" | "exit-fullscreen" | "link" | "panel-open" | "panel-close";
  size?: number;
}) {
  const d: Record<string, React.ReactNode> = {
    play: <path d="M8 5.4v13.2L18.5 12 8 5.4Z" fill="currentColor" />,
    pause: <><rect x="7" y="5" width="3.5" height="14" rx="1.75" fill="currentColor" /><rect x="13.5" y="5" width="3.5" height="14" rx="1.75" fill="currentColor" /></>,
    volume: <><path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M15 8.2c1.5 1.8 1.5 5.8 0 7.6M17.8 5.8c3 3.3 3 9.1 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    settings: <><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M19.4 13.5v-3l-2-.5-.5-1.2 1-1.8-2.1-2.1-1.8 1-1.2-.5-.5-2h-3l-.5 2-1.2.5-1.8-1L3.7 7l1 1.8-.5 1.2-2 .5v3l2 .5.5 1.2-1 1.8 2.1 2.1 1.8-1 1.2.5.5 2h3l.5-2 1.2-.5 1.8 1 2.1-2.1-1-1.8.5-1.2 2-.5Z" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" /></>,
    timer: <><circle cx="12" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M9 2h6M12 2v4M17.5 7.5l1.5-1.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    location: <><path d="M12 21s6-5.5 6-12A6 6 0 1 0 6 9c0 6.5 6 12 6 12Z" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="9" r="2" fill="currentColor" /></>,
    fullscreen: <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
    "exit-fullscreen": <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></>,
    "panel-open": <><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="20" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
    "panel-close": <><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="20" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{d[name]}</svg>;
}
