import { createRoot } from "react-dom/client";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import leadsData from "./leads.json";

type Note = {
  date: string;
  author: string;
  text: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  type: string;
  notes: Note[];
};

type Property = {
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  type: string;
  squareFeet: number;
  price: number;
  zoning: string;
  yearBuilt: number;
  description: string;
};

type Lead = {
  id: string;
  propertyType: "buy" | "sell";
  property: Property;
  status: string;
  priority: "high" | "medium" | "low";
  dateAdded: string;
  contacts: Contact[];
};

const leads: Lead[] = leadsData.leads;

const PROPERTY_TYPES = ["Buy", "Sell"];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  closed: "bg-gray-100 text-gray-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-blue-100 text-blue-800",
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

function formatSquareFeet(sqft: number): string {
  return new Intl.NumberFormat("en-US").format(sqft) + " SF";
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

type LeadCardProps = {
  lead: Lead;
  onClick: () => void;
  isSelected: boolean;
};

function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
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
        <div className="rounded-xl bg-blue-50 p-2.5">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium text-black">
                {lead.property.type} - {lead.property.city}
              </h3>
              <p className="text-sm text-black/50">
                {lead.property.address}
              </p>
            </div>
            <span className="text-lg font-semibold text-black">
              {formatCurrency(lead.property.price)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
                PRIORITY_COLORS[lead.priority]
              }`}
            >
              {lead.priority}
            </span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium uppercase text-purple-800">
              {lead.propertyType}
            </span>
            <span className="text-xs text-black/40">
              {lead.contacts.length} contact{lead.contacts.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-black/40">
              {formatSquareFeet(lead.property.squareFeet)}
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-black/30" />
      </div>
    </motion.div>
  );
}

type LeadDetailProps = {
  lead: Lead;
  onClose: () => void;
};

function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-h-[600px] overflow-y-auto rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-blue-50 p-3">
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-black">
            {lead.property.type}
          </h2>
          <p className="text-sm text-black/50">{lead.property.city}, {lead.property.state}</p>
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

      <div className="mt-4 rounded-xl bg-black/[0.02] p-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 text-black/40" />
          <div>
            <p className="text-sm font-medium text-black">{lead.property.address}</p>
            <p className="text-sm text-black/50">
              {lead.property.city}, {lead.property.state} {lead.property.zip}
            </p>
            <p className="text-xs text-black/40">DuPage County</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Price</p>
          <p className="text-lg font-semibold text-black">
            {formatFullCurrency(lead.property.price)}
          </p>
        </div>
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Square Feet</p>
          <p className="text-lg font-semibold text-black">
            {formatSquareFeet(lead.property.squareFeet)}
          </p>
        </div>
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Year Built</p>
          <p className="text-lg font-semibold text-black">{lead.property.yearBuilt}</p>
        </div>
        <div className="rounded-xl bg-black/[0.02] p-3">
          <p className="text-xs text-black/50">Zoning</p>
          <p className="text-lg font-semibold text-black">{lead.property.zoning}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-black/50">Description</p>
        <p className="mt-1 text-sm text-black/70">{lead.property.description}</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-black/50">Status</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
              STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {lead.status}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
              PRIORITY_COLORS[lead.priority]
            }`}
          >
            {lead.priority} Priority
          </span>
        </div>
        <p className="text-xs text-black/40">Added {lead.dateAdded}</p>
      </div>

      {/* Contacts Section */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-black">
          Contacts ({lead.contacts.length})
        </h3>
        <div className="mt-2 space-y-2">
          {lead.contacts.map((contact) => (
            <div key={contact.id} className="rounded-xl border border-black/5 bg-white">
              <button
                onClick={() =>
                  setExpandedContact(
                    expandedContact === contact.id ? null : contact.id
                  )
                }
                className="w-full p-3 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-black">{contact.name}</p>
                    <p className="text-xs text-black/50">
                      {contact.title} at {contact.company}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="text-black/40">
                        <Mail className="mr-1 inline h-3 w-3" />
                        {contact.email}
                      </span>
                      <span className="text-black/40">
                        <Phone className="mr-1 inline h-3 w-3" />
                        {contact.phone}
                      </span>
                    </div>
                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      {contact.type}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="rounded-full bg-black/5 px-2 py-1 text-xs text-black/60">
                      {contact.notes.length} note{contact.notes.length !== 1 ? "s" : ""}
                    </span>
                    <ChevronRight
                      className={`mt-1 h-4 w-4 text-black/40 transition-transform ${
                        expandedContact === contact.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedContact === contact.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-black/5 p-3">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-black/50">Notes</p>
                        {contact.notes.map((note, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-amber-50/50 p-2.5"
                          >
                            <div className="mb-1 flex items-center gap-2 text-xs text-black/40">
                              <Calendar className="h-3 w-3" />
                              <span>{note.date}</span>
                              <span>•</span>
                              <span>{note.author}</span>
                            </div>
                            <p className="text-sm text-black/70">{note.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                          <Phone className="h-3 w-3" />
                          Call
                        </button>
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-black/10">
                          <Mail className="h-3 w-3" />
                          Email
                        </button>
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-black/10">
                          <FileText className="h-3 w-3" />
                          Note
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

type PropertyTypeFilterProps = {
  types: string[];
  activeType: string | null;
  onSelect: (type: string | null) => void;
};

function PropertyTypeFilter({
  types,
  activeType,
  onSelect,
}: PropertyTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          activeType === null
            ? "bg-black text-white"
            : "bg-black/5 text-black/70 hover:bg-black/10"
        }`}
      >
        All Leads
      </button>
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type.toLowerCase())}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeType === type.toLowerCase()
              ? "bg-black text-white"
              : "bg-black/5 text-black/70 hover:bg-black/10"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activePropertyType, setActivePropertyType] = useState<string | null>(
    null
  );

  const filteredLeads = activePropertyType
    ? leads.filter((lead) => lead.propertyType === activePropertyType)
    : leads;

  // Calculate metrics
  const totalValue = leads.reduce((sum, lead) => sum + lead.property.price, 0);
  const avgPrice = leads.length > 0 ? totalValue / leads.length : 0;
  const buyLeads = leads.filter((l) => l.propertyType === "buy").length;
  const sellLeads = leads.filter((l) => l.propertyType === "sell").length;
  const totalContacts = leads.reduce((sum, lead) => sum + lead.contacts.length, 0);
  const highPriorityLeads = leads.filter((l) => l.priority === "high").length;

  return (
    <div className="min-h-[480px] w-full bg-[#FAFAFA] p-5 antialiased">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black">
          DuPage County Commercial Real Estate Leads
        </h1>
        <p className="text-sm text-black/50">
          Track properties and manage client relationships
        </p>
      </header>

      {/* Metrics Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          title="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          icon={<DollarSign className="h-5 w-5 text-black/50" />}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Active Leads"
          value={leads.length.toString()}
          subtitle={`${buyLeads} buy, ${sellLeads} sell`}
          icon={<Building2 className="h-5 w-5 text-black/50" />}
        />
        <MetricCard
          title="Total Contacts"
          value={totalContacts.toString()}
          subtitle={`Avg ${formatCurrency(avgPrice)} per property`}
          icon={<Users className="h-5 w-5 text-black/50" />}
        />
        <MetricCard
          title="High Priority"
          value={highPriorityLeads.toString()}
          subtitle={`${Math.round((highPriorityLeads / leads.length) * 100)}% of pipeline`}
          icon={<TrendingUp className="h-5 w-5 text-black/50" />}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Property Type Filter */}
      <div className="mb-4">
        <PropertyTypeFilter
          types={PROPERTY_TYPES}
          activeType={activePropertyType}
          onSelect={setActivePropertyType}
        />
      </div>

      {/* Leads Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => setSelectedLead(lead)}
                isSelected={selectedLead?.id === lead.id}
              />
            ))}
          </AnimatePresence>
          {filteredLeads.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
              <p className="text-black/50">No leads in this category</p>
            </div>
          )}
        </div>

        {/* Lead Detail Panel */}
        <div className="hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedLead ? (
              <LeadDetail
                key={selectedLead.id}
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center"
              >
                <p className="text-black/40">Select a lead to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("sales-dashboard-root")!).render(<App />);
