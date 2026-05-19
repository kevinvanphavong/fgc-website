'use client';

export default function ManageCookiesLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('fgc:open-cookies'))}
      className="text-[0.8rem] text-fgc-cream/70 underline-offset-4 hover:text-fgc-yellow hover:underline"
    >
      Gérer mes cookies
    </button>
  );
}
