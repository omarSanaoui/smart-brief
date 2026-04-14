import { useEffect, useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import Select from "react-select";
import type { StylesConfig } from "react-select";
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
  description: string;
  budgetRange: string;
  deadline: string; // YYYY-MM-DD
  featuresText: string; // one per line or comma-separated
};

type SelectOption = { value: string; label: string };

const selectStyles = (disabled: boolean): StylesConfig<SelectOption, false> => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: "#2D3652",
    borderColor: state.isFocused ? "#67CFB1" : "#2E3A5C",
    borderRadius: "6px",
    padding: "4px 4px",
    boxShadow: "none",
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : "auto",
    "&:hover": { borderColor: "#67CFB1" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1e2a42",
    border: "1px solid #2E3A5C",
    borderRadius: "8px",
    zIndex: 9999,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#414CC4" : "transparent",
    color: "white",
    fontSize: "13px",
    cursor: "pointer",
    "&:active": { backgroundColor: "#67CFB1" },
  }),
  singleValue: (base) => ({ ...base, color: "#fff", fontSize: "13px" }),
  placeholder: (base) => ({ ...base, color: "rgba(255,255,255,0.4)", fontSize: "13px" }),
  input: (base) => ({ ...base, color: "#fff" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#67CFB1" : "rgba(255,255,255,0.4)",
    "&:hover": { color: "#67CFB1" },
  }),
});

const projectTypeOptions: Array<{ value: ProjectType; label: string }> = [
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

const toDateInputValue = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseFeatures = (text: string) => {
  const split = text
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(split));
};

export default function EditBriefModal({ brief, isOpen, onClose }: EditBriefModalProps) {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => ({
    title: brief?.title ?? "",
    projectType: (brief?.projectType ?? "WEB") as ProjectType,
    description: brief?.description ?? "",
    budgetRange: brief?.budgetRange ?? "",
    deadline: brief?.deadline ? toDateInputValue(brief.deadline) : "",
    featuresText: brief?.features?.join("\n") ?? "",
  }));

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

  const handleSave = async () => {
    if (!canEdit) return;

    const title = form.title.trim();
    const description = form.description.trim();
    const budgetRange = form.budgetRange.trim();
    const features = parseFeatures(form.featuresText);
    const deadline = form.deadline.trim();

    if (!title || !description || !budgetRange || !deadline) {
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
          // Backend expects a date-parsable string.
          deadline,
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
                disabled={!canEdit || saving}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                placeholder="Project title..."
              />
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Project Type
              </label>
              <Select
                options={projectTypeOptions}
                value={projectTypeOptions.find(o => o.value === form.projectType) ?? null}
                onChange={(opt) => opt && setForm((prev) => ({ ...prev, projectType: opt.value as ProjectType }))}
                isDisabled={!canEdit || saving}
                styles={selectStyles(!canEdit || saving)}
                placeholder="Select project type..."
                menuPortalTarget={document.body}
              />
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Budget Range
              </label>
              <input
                value={form.budgetRange}
                onChange={(e) => setForm((prev) => ({ ...prev, budgetRange: e.target.value }))}
                disabled={!canEdit || saving}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                placeholder="ex: 25 000 – 50 000 MAD"
              />
            </div>

            <div>
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Deadline
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                disabled={!canEdit || saving}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                disabled={!canEdit || saving}
                rows={5}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none disabled:opacity-60"
                placeholder="Describe the project scope and goals..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">
                Features
              </label>
              <textarea
                value={form.featuresText}
                onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
                disabled={!canEdit || saving}
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
              disabled={!canEdit || saving}
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
      `}</style>
    </div>
  );
}
