import { createRoot } from "react-dom/client";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dealsData from "./deals.json";

type Deal = {
  id: string;
  company: string;
  logo: string;
  value: number;
  stage: string;
  probability: number;
  contact: string;
  contactRole: string;
  daysInStage: number;
  expectedClose: string;
  lastActivity: string;
  tags: string[];
};

type Metrics = {
  totalPipeline: number;
  weightedPipeline: number;
  dealsInPipeline: number;
  avgDealSize: number;
  winRate: number;
  avgSalesCycle: number;
};

const deals: Deal[] = dealsData.deals;
const metrics: Metrics = dealsData.metrics;

const STAGES = ["Discovery", "Proposal", "Negotiation", "Closed Won"];

const STAGE_COLORS: Record<string, string> = {
  Discovery: "bg-purple-100 text-purple-800",
  Proposal: "bg-amber-100 text-amber-800",
  Negotiation: "bg-blue-100 text-blue-800",
  "Closed Won": "bg-green-100 text-green-800",
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
};

function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-black/50">{title}</p>
          <p className="text-2xl font-semibold text-black">{value}</p>
          {subtitle && (
            <p className="text-xs text-black/50">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% vs last month
            </p>
          )}
        </div>
        <div className="rounded-xl bg-black/5 p-2.5">{icon}</div>
      </div>
    </div>
  );
}

type DealCardProps = {
  deal: Deal;
  onClick: () => void;
  isSelected: boolean;
};

function DealCard({ deal, onClick, isSelected }: DealCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border bg-white p-4 transition-all hover:shadow-md ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-black/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={deal.logo}
          alt={deal.company}
          className="h-10 w-10 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-black">
                {deal.company}
              </h3>
              <p className="text-sm text-black/50">{deal.contact}</p>
            </div>
            <span className="text-lg font-semibold text-black">
              {formatCurrency(deal.value)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                STAGE_COLORS[deal.stage] || "bg-gray-100 text-gray-800"
              }`}
            >
              {deal.stage}
            </span>
            <span className="text-xs text-black/40">
              {deal.probability}% probability
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-black/30" />
      </div>
    </motion.div>
  );
}

type DealDetailProps = {
  deal: Deal;
  onClose: () => void;
};

function DealDetail({ deal, onClose }: DealDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <img
          src={deal.logo}
          alt={deal.company}
          className="h-14 w-14 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-black">{deal.company}</h2>
          <p className="text-sm text-black/50">{deal.contactRole}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-black/40 hover:bg-black/5 hover:text-black"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Deal Value</p>
          <p className="text-lg font-semibold text-black">
            {formatFullCurrency(deal.value)}
          </p>
        </div>
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Weighted Value</p>
          <p className="text-lg font-semibold text-black">
            {formatFullCurrency(deal.value * (deal.probability / 100))}
          </p>
        </div>
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Probability</p>
          <p className="text-lg font-semibold text-black">{deal.probability}%</p>
        </div>
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Days in Stage</p>
          <p className="text-lg font-semibold text-black">{deal.daysInStage}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-xs font-medium text-black/50">Stage</p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
              STAGE_COLORS[deal.stage] || "bg-gray-100 text-gray-800"
            }`}
          >
            {deal.stage}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-black/50">Expected Close</p>
          <p className="text-sm text-black">{deal.expectedClose}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-black/50">Last Activity</p>
          <p className="text-sm text-black">{deal.lastActivity}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-black/50">Tags</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {deal.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Phone className="h-4 w-4" />
          Call
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black/5 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/10">
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black/5 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/10">
          <Calendar className="h-4 w-4" />
          Schedule
        </button>
      </div>
    </motion.div>
  );
}

type StageFilterProps = {
  stages: string[];
  activeStage: string | null;
  onSelect: (stage: string | null) => void;
};

function StageFilter({ stages, activeStage, onSelect }: StageFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          activeStage === null
            ? "bg-black text-white"
            : "bg-black/5 text-black/70 hover:bg-black/10"
        }`}
      >
        All Deals
      </button>
      {stages.map((stage) => (
        <button
          key={stage}
          onClick={() => onSelect(stage)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeStage === stage
              ? "bg-black text-white"
              : "bg-black/5 text-black/70 hover:bg-black/10"
          }`}
        >
          {stage}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const filteredDeals = activeStage
    ? deals.filter((deal) => deal.stage === activeStage)
    : deals;

  return (
    <div className="min-h-[480px] w-full bg-[#FAFAFA] p-5 antialiased">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black">Sales Pipeline</h1>
        <p className="text-sm text-black/50">
          Track your deals and close more revenue
        </p>
      </header>

      {/* Metrics Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          title="Total Pipeline"
          value={formatCurrency(metrics.totalPipeline)}
          icon={<DollarSign className="h-5 w-5 text-black/50" />}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Weighted Pipeline"
          value={formatCurrency(metrics.weightedPipeline)}
          subtitle="Expected revenue"
          icon={<Target className="h-5 w-5 text-black/50" />}
        />
        <MetricCard
          title="Active Deals"
          value={metrics.dealsInPipeline.toString()}
          subtitle={`Avg ${formatCurrency(metrics.avgDealSize)}`}
          icon={<Users className="h-5 w-5 text-black/50" />}
        />
        <MetricCard
          title="Win Rate"
          value={`${metrics.winRate}%`}
          subtitle={`${metrics.avgSalesCycle} day cycle`}
          icon={<TrendingUp className="h-5 w-5 text-black/50" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Stage Filter */}
      <div className="mb-4">
        <StageFilter
          stages={STAGES}
          activeStage={activeStage}
          onSelect={setActiveStage}
        />
      </div>

      {/* Deals Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => setSelectedDeal(deal)}
                isSelected={selectedDeal?.id === deal.id}
              />
            ))}
          </AnimatePresence>
          {filteredDeals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
              <p className="text-black/50">No deals in this stage</p>
            </div>
          )}
        </div>

        {/* Deal Detail Panel */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedDeal ? (
              <DealDetail
                key={selectedDeal.id}
                deal={selectedDeal}
                onClose={() => setSelectedDeal(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center"
              >
                <p className="text-black/40">Select a deal to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("sales-dashboard-root")!).render(<App />);
