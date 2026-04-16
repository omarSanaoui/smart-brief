import { useEffect, useState } from "react";
import { X, Save, AlertTriangle, Calendar, ChevronDown } from "lucide-react";
import { DatePicker, Portal, Select, createListCollection } from "@chakra-ui/react";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import { useAppDispatch } from "../../app/hooks";
import { updateBriefThunk } from "../../features/briefs/briefSlice/briefThunk";
import type { Brief, ProjectType } from "../../features/briefs/briefSlice/briefTypes";

type EditBriefModalProps = {
  brief: Brief | null;
  isOpen: boolean;
  onClose: () => void;
};

type FormState = {
  title: string;
  projectType: ProjectType;
  brand: string;
  coreGoal: string;
  budgetRange: string;
  deadline: Date | null;
  featuresText: string;
};

function parseDescription(raw: string) {
  const brandMatch = raw.match(/^Brand:\s*([\s\S]*?)(?:\n\nCore Goal:|$)/);
  const goalMatch = raw.match(/Core Goal:\s*([\s\S]*)$/);
  return {
    brand: brandMatch?.[1]?.trim() ?? raw,
    coreGoal: goalMatch?.[1]?.trim() ?? "",
  };
}

const projectTypeItems = [
  { value: "SITE_WEB", label: "Website Design & Development" },
  { value: "SEO", label: "Natural SEO" },
  { value: "GOOGLE_ADS", label: "Google Paid Ads" },
  { value: "SOCIAL_MEDIA", label: "Social Media & Campaigns" },
  { value: "PHOTO_VIDEO", label: "Photography & Videography" },
  { value: "EMAIL_MARKETING", label: "Email Marketing Campaign" },
  { value: "COMMUNITY_MANAGER", label: "Community Manager" },
  { value: "BRANDING", label: "Branding & Visual Identity" },
  { value: "OTHER", label: "Other" },
];

const budgetItems = [
  { value: "3 000 – 10 000 MAD", label: "3 000 – 10 000 MAD" },
  { value: "10 000 – 25 000 MAD", label: "10 000 – 25 000 MAD" },
  { value: "25 000 – 50 000 MAD", label: "25 000 – 50 000 MAD" },
  { value: "50 000 – 100 000 MAD", label: "50 000 – 100 000 MAD" },
  { value: "100 000+ MAD", label: "100 000+ MAD" },
];

const projectTypeCollection = createListCollection({ items: projectTypeItems });
const budgetCollection = createListCollection({ items: budgetItems });

const parseFeatures = (text: string) => {
  const split = text
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(split));
};

export default function EditBriefModal({ brief, isOpen, onClose }: EditBriefModalProps) {
  const dispatch = useAppDispatch();
  const timeZone = getLocalTimeZone();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => {
    const { brand, coreGoal } = parseDescription(brief?.description ?? "");
    return {
      title: brief?.title ?? "",
      projectType: (brief?.projectType ?? "SITE_WEB") as ProjectType,
      brand,
      coreGoal,
      budgetRange: brief?.budgetRange ?? "",
      deadline: brief?.deadline ? new Date(brief.deadline) : null,
      featuresText: brief?.features?.join("\n") ?? "",
    };
  });

  const canRender = Boolean(isOpen && brief);

  useEffect(() => {
    if (!canRender) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [canRender]);

  if (!canRender || !brief) return null;

  const canEdit = brief.status === "PENDING";
  const disabled = !canEdit || saving;

  const handleSave = async () => {
    if (!canEdit) return;

    const title = form.title.trim();
    const brand = form.brand.trim();
    const coreGoal = form.coreGoal.trim();
    const budgetRange = form.budgetRange.trim();
    const features = parseFeatures(form.featuresText);
    const description = `Brand: ${brand}\n\nCore Goal: ${coreGoal}`;

    if (!title || !brand || !coreGoal || !budgetRange || !form.deadline) {
      setError("Please fill in all required fields.");
      return;
    }
    if (features.length === 0) {
      setError("Please add at least one feature.");
      return;
    }

    setSaving(true);
    setError(null);
    const result = await dispatch(
      updateBriefThunk({
        id: brief.id,
        data: {
          title,
          projectType: form.projectType,
          description,
          features,
          budgetRange,
          deadline: form.deadline.toISOString(),
        },
      }),
    );

    setSaving(false);
    if (updateBriefThunk.fulfilled.match(result)) {
      onClose();
      return;
    }
    setError((result.payload as string) || "Failed to update brief.");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6 sm:p-0">
      <div
        className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[820px] max-h-[90vh] overflow-hidden rounded-3xl border border-[#2E3A5C] bg-[#141B2D] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2E3A5C]/40 bg-[#141B2D]/80 px-6 py-5 backdrop-blur-sm">
          <div className="min-w-0">
            <h3 className="truncate text-white font-black uppercase tracking-widest text-xs">
              Edit Brief
            </h3>
            <p className="truncate text-white/40 text-[11px] font-mono tracking-[0.18em] uppercase mt-1">
              {brief.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D3652]/40 text-white/40 hover:bg-[#2D3652] hover:text-white transition-all border border-[#2E3A5C]/40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6 thin-scrollbar">
          {!canEdit && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-200">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div className="text-sm">
                This brief can only be edited while it is <span className="font-bold">PENDING</span>.
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-rose-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Project Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                disabled={disabled}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                placeholder="Project title..."
              />
            </div>

            {/* Project Type */}
            <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Project Type
              </label>
              <Select.Root
                collection={projectTypeCollection}
                value={[form.projectType]}
                onValueChange={({ value }) =>
                  setForm((prev) => ({ ...prev, projectType: value[0] as ProjectType }))
                }
                positioning={{ placement: "bottom-start", sameWidth: true }}
              >
                <Select.HiddenSelect />
                <Select.Control className="eb-select-control w-full rounded-md border border-[#2E3A5C] bg-[#2D3652] transition-colors">
                  <Select.Trigger className="eb-select-trigger flex w-full items-center justify-between px-4 py-3 text-sm text-white focus:outline-none">
                    <Select.ValueText placeholder="Select project type..." className="text-sm text-white" />
                    <Select.IndicatorGroup>
                      <Select.Indicator><ChevronDown size={14} className="text-white/40" /></Select.Indicator>
                    </Select.IndicatorGroup>
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content className="eb-select-content z-[9999] rounded-lg border border-[#2E3A5C] bg-[#1e2a42] py-1 shadow-2xl">
                      {projectTypeCollection.items.map((item) => (
                        <Select.Item
                          key={item.value}
                          item={item}
                          className="eb-select-item flex cursor-pointer items-center px-4 py-2.5 text-sm text-white transition-colors"
                        >
                          <Select.ItemText>{item.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </div>

            {/* Budget Range */}
            <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Budget Range
              </label>
              <Select.Root
                collection={budgetCollection}
                value={form.budgetRange ? [form.budgetRange] : []}
                onValueChange={({ value }) =>
                  setForm((prev) => ({ ...prev, budgetRange: value[0] ?? "" }))
                }
                positioning={{ placement: "bottom-start", sameWidth: true }}
              >
                <Select.HiddenSelect />
                <Select.Control className="eb-select-control w-full rounded-md border border-[#2E3A5C] bg-[#2D3652] transition-colors">
                  <Select.Trigger className="eb-select-trigger flex w-full items-center justify-between px-4 py-3 text-sm text-white focus:outline-none">
                    <Select.ValueText placeholder="Select budget range..." className="text-sm text-white" />
                    <Select.IndicatorGroup>
                      <Select.Indicator><ChevronDown size={14} className="text-white/40" /></Select.Indicator>
                    </Select.IndicatorGroup>
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content className="eb-select-content z-[9999] rounded-lg border border-[#2E3A5C] bg-[#1e2a42] py-1 shadow-2xl">
                      {budgetCollection.items.map((item) => (
                        <Select.Item
                          key={item.value}
                          item={item}
                          className="eb-select-item flex cursor-pointer items-center px-4 py-2.5 text-sm text-white transition-colors"
                        >
                          <Select.ItemText>{item.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </div>

            {/* Deadline */}
            <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Deadline
              </label>
              <DatePicker.Root
                value={form.deadline ? [fromDate(form.deadline, timeZone)] : []}
                onValueChange={({ value }) =>
                  setForm((prev) => ({ ...prev, deadline: value[0]?.toDate(timeZone) ?? null }))
                }
                min={fromDate(new Date(), timeZone)}
                closeOnSelect
                positioning={{ placement: "top-start" }}
              >
                <DatePicker.Control className="edit-dp-control group flex w-full items-center rounded-md border border-[#2E3A5C] bg-[#2D3652] transition-colors focus-within:border-sbteal focus-within:ring-1 focus-within:ring-sbteal">
                  <DatePicker.Input
                    placeholder="Desired Launch Date"
                    className="edit-dp-input w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none"
                  />
                  <DatePicker.IndicatorGroup className="pr-3">
                    <DatePicker.Trigger
                      className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                      aria-label="Open calendar"
                    >
                      <Calendar className="w-4 h-4" />
                    </DatePicker.Trigger>
                  </DatePicker.IndicatorGroup>
                </DatePicker.Control>
                <Portal>
                  <DatePicker.Positioner>
                    <DatePicker.Content className="edit-dp-popup z-[200] rounded-xl border border-[#2E3A5C] bg-[#1a2238] p-3 text-white shadow-2xl">
                      <DatePicker.View view="day" className="w-[288px]">
                        <DatePicker.Header className="mb-3" />
                        <DatePicker.DayTable />
                      </DatePicker.View>
                      <DatePicker.View view="month" className="w-[288px]">
                        <DatePicker.Header className="mb-3" />
                        <DatePicker.MonthTable />
                      </DatePicker.View>
                      <DatePicker.View view="year" className="w-[288px]">
                        <DatePicker.Header className="mb-3" />
                        <DatePicker.YearTable />
                      </DatePicker.View>
                    </DatePicker.Content>
                  </DatePicker.Positioner>
                </Portal>
              </DatePicker.Root>
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Brand
              </label>
              <input
                value={form.brand}
                onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                disabled={disabled}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                placeholder="Describe your brand..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Core Goal
              </label>
              <textarea
                value={form.coreGoal}
                onChange={(e) => setForm((prev) => ({ ...prev, coreGoal: e.target.value }))}
                disabled={disabled}
                rows={3}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none disabled:opacity-60"
                placeholder="What is the main goal of this project?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Features
              </label>
              <textarea
                value={form.featuresText}
                onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
                disabled={disabled}
                rows={4}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none disabled:opacity-60"
                placeholder={"One per line, or comma-separated.\nExample:\nLogin\nPayments\nDashboard"}
              />
              <p className="mt-2 text-[11px] text-white/35">
                Tip: press Enter for a new feature.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-[#2D3652]/60 hover:bg-[#2D3652] text-white/70 hover:text-white border border-[#2E3A5C]/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={disabled}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-sbpurple/30 transition-all flex items-center gap-2"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #2E3A5C; border-radius: 10px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: #414CC4; }

        .eb-select-control { border-color: #2E3A5C !important; box-shadow: none !important; }
        .eb-select-trigger:focus, .eb-select-trigger:focus-visible { outline: none !important; box-shadow: none !important; }
        .eb-select-control:focus-within { border-color: #67CFB1 !important; box-shadow: 0 0 0 1px #67CFB1 !important; }
        .eb-select-content { background-color: #1e2a42 !important; border: 1px solid #2E3A5C !important; }
        .eb-select-item { color: white !important; background-color: transparent !important; }
        .eb-select-item:hover { background-color: #414CC4 !important; color: white !important; }
        .eb-select-item[data-highlighted] { background-color: #414CC4 !important; color: white !important; }
        .eb-select-item[data-selected] { background-color: rgba(65,76,196,0.75) !important; color: white !important; }

        .edit-dp-input {
          color: white !important; caret-color: white;
          border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important;
        }
        .edit-dp-input::placeholder { color: rgba(255,255,255,0.4) !important; }
        .edit-dp-input:hover, .edit-dp-input:focus, .edit-dp-input:focus-visible {
          border: none !important; outline: none !important; box-shadow: none !important;
        }
        .edit-dp-control { border-color: #2E3A5C !important; box-shadow: none !important; }
        .edit-dp-control:focus-within { border-color: #67CFB1 !important; box-shadow: 0 0 0 1px #67CFB1 !important; }

        .edit-dp-popup { min-width: 312px; border-radius: 14px; border: 1px solid #2E3A5C; background: #1A2238; box-shadow: 0 24px 60px rgba(0,0,0,0.42); }
        .edit-dp-popup [data-part="view-control"] { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
        .edit-dp-popup [data-part="prev-trigger"],
        .edit-dp-popup [data-part="next-trigger"],
        .edit-dp-popup [data-part="view-trigger"] { border-radius: 8px; color: white !important; transition: background-color 0.2s; }
        .edit-dp-popup [data-part="prev-trigger"]:hover,
        .edit-dp-popup [data-part="next-trigger"]:hover,
        .edit-dp-popup [data-part="view-trigger"]:hover { background: rgba(255,255,255,0.08); }
        .edit-dp-popup [data-part="table"] { width: 100%; border-collapse: separate; border-spacing: 6px; }
        .edit-dp-popup [data-part="table-header"] { color: rgba(255,255,255,0.45) !important; font-size: 12px; font-weight: 500; text-align: center; padding-bottom: 4px; }
        .edit-dp-popup [data-part="table-cell-trigger"] { height: 34px; border: none !important; outline: none !important; border-radius: 10px; color: white !important; font-size: 13px; transition: background-color 0.2s; }
        .edit-dp-popup [data-part="table-cell-trigger"]:hover { background: rgba(103,207,177,0.18); }
        .edit-dp-popup [data-part="table-cell-trigger"][data-selected] { background: #414CC4; color: white !important; }
        .edit-dp-popup [data-part="table-cell-trigger"][data-today] { box-shadow: inset 0 0 0 1px rgba(103,207,177,0.55); }
        .edit-dp-popup [data-part="table-cell-trigger"][data-outside-range],
        .edit-dp-popup [data-part="table-cell-trigger"][data-disabled] { color: rgba(255,255,255,0.28) !important; }
        .edit-dp-popup button:focus, .edit-dp-popup button:focus-visible,
        .edit-dp-popup [data-part="table-cell-trigger"]:focus,
        .edit-dp-popup [data-part="table-cell-trigger"]:focus-visible { outline: none !important; box-shadow: none; }
        .edit-dp-popup select, .edit-dp-popup button, .edit-dp-popup th,
        .edit-dp-popup td, .edit-dp-popup span, .edit-dp-popup div { color: inherit; }
      `}</style>
    </div>
  );
}
