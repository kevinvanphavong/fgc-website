'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { NAV, RESERVATION_URL, type NavItem, type NavGroup } from '@/lib/nav';
import { cn } from '@/lib/cn';

function isGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [pathname]);

  function handleDropdownEnter(key: string) {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(key);
  }

  function handleDropdownLeave() {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(null), 150);
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-fgc-yellow/15 bg-fgc-bg-deeper/[0.78] backdrop-blur-[14px] backdrop-saturate-150">
      <div className="wrap flex items-center justify-between py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3" aria-label="Accueil">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-fgc-sm bg-fgc-yellow font-display text-lg text-fgc-purple shadow-fgc-3d-yellow-sm">
            FG
          </div>
          <div className="font-display leading-none uppercase">
            <div className="text-[0.85em] tracking-fgc-cap text-fgc-pink-hot">
              FAMILY
            </div>
            <div className="text-[1.1em] tracking-fgc-cap text-fgc-yellow">
              GAMES
            </div>
            <div className="text-[0.65em] tracking-fgc-bot text-fgc-cream">
              CENTER
            </div>
          </div>
        </Link>

        {/* Nav — burger at ≤720px (md breakpoint per DS §3.4) */}
        <nav
          className={cn(
            'max-md:fixed max-md:inset-x-0 max-md:top-[var(--header-h,64px)] max-md:bg-fgc-bg-deeper/95 max-md:backdrop-blur-[14px] max-md:border-b max-md:border-fgc-yellow/15 max-md:p-6',
            'md:flex md:items-center md:gap-1',
            mobileOpen ? 'max-md:flex max-md:flex-col max-md:gap-2' : 'max-md:hidden'
          )}
          aria-label="Navigation principale"
        >
          {NAV.map((item) =>
            isGroup(item) ? (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(item.key)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3.5 py-2.5 font-display text-[0.95rem] uppercase transition-colors',
                    dropdownOpen === item.key || item.children.some((c) => isActive(c.href, pathname))
                      ? 'bg-fgc-yellow/[0.12] text-fgc-yellow'
                      : 'text-fgc-cream hover:bg-fgc-yellow/[0.08] hover:text-fgc-yellow'
                  )}
                  onClick={() =>
                    setDropdownOpen(dropdownOpen === item.key ? null : item.key)
                  }
                  aria-expanded={dropdownOpen === item.key}
                  aria-haspopup="true"
                >
                  {item.label}
                  <span
                    className={cn(
                      'text-[0.7em] transition-transform',
                      dropdownOpen === item.key && 'rotate-180'
                    )}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {/* Dropdown */}
                <div
                  className={cn(
                    'md:absolute md:left-0 md:top-full md:mt-1 md:min-w-[220px] md:rounded-fgc-card-soft md:border md:border-fgc-yellow/20 md:bg-[rgba(15,5,40,0.96)] md:p-2.5 md:shadow-fgc-soft',
                    'max-md:flex max-md:flex-col max-md:pl-4',
                    dropdownOpen === item.key ? 'flex flex-col gap-0.5' : 'hidden'
                  )}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={cn(
                        'rounded-full px-3.5 py-2.5 font-display text-[0.9rem] uppercase transition-colors',
                        isActive(child.href, pathname)
                          ? 'bg-fgc-yellow/[0.12] text-fgc-yellow'
                          : 'text-fgc-cream hover:bg-fgc-yellow/[0.08] hover:text-fgc-yellow'
                      )}
                    >
                      <span aria-hidden="true">
                        {child.label.split(' ')[0]}
                      </span>{' '}
                      {child.label.split(' ').slice(1).join(' ')}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'rounded-full px-3.5 py-2.5 font-display text-[0.95rem] uppercase transition-colors',
                  isActive(item.href, pathname)
                    ? 'bg-fgc-yellow/[0.12] text-fgc-yellow'
                    : 'text-fgc-cream hover:bg-fgc-yellow/[0.08] hover:text-fgc-yellow'
                )}
              >
                {item.label}
              </Link>
            )
          )}

          {/* CTA mobile */}
          <a
            href={RESERVATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 font-display text-[1rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px md:hidden"
          >
            Réserver
          </a>
        </nav>

        {/* CTA desktop + burger */}
        <div className="flex items-center gap-3">
          <a
            href={RESERVATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2.5 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 font-display text-[1rem] uppercase text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px md:inline-flex"
          >
            Réserver
          </a>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-fgc-sm text-fgc-cream md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
