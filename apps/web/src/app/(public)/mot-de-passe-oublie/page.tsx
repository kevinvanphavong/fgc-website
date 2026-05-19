import ForgotPasswordForm from '@/components/sections/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe Family Games Center.',
};

export default function ForgotPasswordPage() {
  return (
    <section className="section">
      <div className="wrap mx-auto flex max-w-[460px] flex-col gap-6">
        <header className="text-center">
          <span className="inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Espace client
          </span>
          <h1 className="mt-2 hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Mot de passe <span className="pop">oublié</span>
          </h1>
          <p className="mt-3 max-w-fgc-lead text-[1rem] text-fgc-cream/80 mx-auto">
            Entrez votre email — si un compte existe, nous vous enverrons un lien de réinitialisation.
          </p>
        </header>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
