import { Suspense } from 'react';
import {
  CircleDollarSign,
  CalendarCheck,
  Activity,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/admin-auth';
import { getDashboard } from '@/lib/admin-api';
import KpiCard, { KpiCardSkeleton } from '@/components/admin/dashboard/KpiCard';
import RecentActivity from '@/components/admin/dashboard/RecentActivity';
import DemoBanner from '@/components/admin/DemoBanner';
import RefreshButton from '@/components/admin/dashboard/RefreshButton';
import { currencyEUR, percent } from '@/lib/intl';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  return (
    <>
      <DashboardHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardHeader() {
  const user = await getCurrentUser();
  const firstName = user?.firstName ?? user?.email ?? 'Bonjour';
  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[1.5rem] font-semibold text-admin-text">
          Bonjour {firstName}{' '}
          <span className="font-medium text-admin-text-muted">· {today}</span>
        </h1>
        <p className="mt-1 text-[0.8125rem] text-admin-text-muted">
          Vue d&apos;ensemble : KPIs, activité récente, notifications.
        </p>
      </div>
      <RefreshButton />
    </div>
  );
}

async function DashboardContent() {
  const data = await getDashboard();

  return (
    <>
      <DemoBanner visible={data.meta.demo} />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="CA aujourd'hui"
          icon={CircleDollarSign}
          value={currencyEUR.format(data.kpis.revenueToday.value)}
          delta={data.kpis.revenueToday.delta}
          deltaSuffix="vs sem. passée"
          sparkline={data.kpis.revenueToday.spark}
          accent="brand"
        />
        <KpiCard
          label="Réservations aujourd'hui"
          icon={CalendarCheck}
          value={String(data.kpis.reservationsToday.value)}
          delta={data.kpis.reservationsToday.delta}
          deltaSuffix="vs hier"
          sparkline={data.kpis.reservationsToday.spark}
          accent="green"
        />
        <KpiCard
          label="Taux occupation pistes"
          icon={Activity}
          value={percent.format(data.kpis.occupancyRate.value)}
          delta={data.kpis.occupancyRate.delta}
          deltaSuffix="vs sem. passée"
          sparkline={data.kpis.occupancyRate.spark}
          accent="amber"
        />
        <KpiCard
          label="CA mois en cours"
          icon={Briefcase}
          value={currencyEUR.format(data.kpis.revenueMonth.value)}
          delta={data.kpis.revenueMonth.delta}
          deltaSuffix="vs mois passé"
          sparkline={data.kpis.revenueMonth.spark}
          accent="pink"
        />
        <KpiCard
          label="Pipeline B2B"
          icon={TrendingUp}
          value={currencyEUR.format(data.kpis.b2bPipeline.value)}
          delta={data.kpis.b2bPipeline.delta}
          deltaSuffix="stages ouverts"
          sparkline={data.kpis.b2bPipeline.spark}
          accent="brand"
        />
      </div>

      <RecentActivity items={data.recentActivity} />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-admin-border bg-admin-bg-elev" />
    </>
  );
}
