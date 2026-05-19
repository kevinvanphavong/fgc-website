'use client';

import Stepper from './Stepper';
import Step1Formule from './Step1Formule';
import Step2Date from './Step2Date';
import Step3Enfant from './Step3Enfant';
import Step4Coordonnees from './Step4Coordonnees';
import Step5Recap from './Step5Recap';
import StepConfirmation from './StepConfirmation';
import { useReservationTunnel } from './useReservationTunnel';
import type { AnnivFormule } from './types';

interface TunnelProps {
  formules: AnnivFormule[];
  prefillFormule?: string | null;
}

export default function TunnelAnniversaire({ formules, prefillFormule }: TunnelProps) {
  const {
    draft,
    hydrated,
    update,
    setStep,
    goNext,
    goBack,
    confirm,
    completedSteps,
    scrollAnchorRef,
  } = useReservationTunnel(prefillFormule);

  // Skeleton minimal le temps d'hydrater le sessionStorage — évite le flash
  // "tu n'as rien sélectionné" si le user a déjà progressé puis refresh.
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-fgc-wrap px-4 py-12 text-center text-fgc-cream/70">
        Chargement…
      </div>
    );
  }

  return (
    <main
      className="mx-auto max-w-fgc-wrap px-4 py-10 md:py-14"
      data-tunnel-step={draft.step}
    >
      <div ref={scrollAnchorRef} aria-hidden />

      <Stepper current={draft.step} completed={completedSteps} onJump={setStep} />

      {draft.step === 'formule' && (
        <Step1Formule
          formules={formules}
          draft={draft}
          onSelect={(key) => update({ formuleKey: key })}
          onNext={goNext}
        />
      )}
      {draft.step === 'date' && (
        <Step2Date draft={draft} update={update} onNext={goNext} onBack={goBack} />
      )}
      {draft.step === 'enfant' && (
        <Step3Enfant
          formules={formules}
          draft={draft}
          update={update}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {draft.step === 'coordonnees' && (
        <Step4Coordonnees draft={draft} update={update} onNext={goNext} onBack={goBack} />
      )}
      {draft.step === 'recap' && (
        <Step5Recap
          formules={formules}
          draft={draft}
          onBack={goBack}
          onJump={setStep}
          onConfirmed={(reservation) => confirm(reservation)}
        />
      )}
      {draft.step === 'confirmation' && draft.reservation && (
        <StepConfirmation
          formules={formules}
          draft={draft}
          reservation={draft.reservation}
        />
      )}
    </main>
  );
}
