import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DatePicker, Portal } from "@chakra-ui/react";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import Select from "react-select";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createBriefThunk, updateBriefThunk } from "../../features/briefs/briefSlice/briefThunk";
import { selectBriefsLoading } from "../../features/briefs/briefSlice/briefSelectors";
import type { Brief, ProjectType } from "../../features/briefs/briefSlice/briefTypes";
import { UploadCloud, CheckCircle, ArrowRight, ArrowLeft, Calendar, X } from "lucide-react";
import type { MultiValue, StylesConfig } from "react-select";
import { useTranslation } from "react-i18next";
import api from "../../features/briefs/api/briefAxios";

const serviceOptions = [
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

const featureOptions = [
  { value: "Responsive Design", label: "Responsive Design" },
  { value: "SEO Optimization", label: "SEO Optimization" },
  { value: "Social Media Integration", label: "Social Media Integration" },
  { value: "Google Analytics", label: "Google Analytics" },
  { value: "Content Creation", label: "Content Creation" },
  { value: "Ad Campaign Setup", label: "Ad Campaign Setup" },
  { value: "Email Templates", label: "Email Templates" },
  { value: "Brand Guidelines", label: "Brand Guidelines" },
  { value: "Logo & Brand Identity", label: "Logo & Brand Identity" },
  { value: "Photo Shooting", label: "Photo Shooting" },
  { value: "Video Production", label: "Video Production" },
  { value: "Monthly Reporting", label: "Monthly Reporting" },
  { value: "E-reputation Management", label: "E-reputation Management" },
];

const budgetOptions = [
  { value: "3 000 – 10 000 MAD", label: "3 000 – 10 000 MAD" },
  { value: "10 000 – 25 000 MAD", label: "10 000 – 25 000 MAD" },
  { value: "25 000 – 50 000 MAD", label: "25 000 – 50 000 MAD" },
  { value: "50 000 – 100 000 MAD", label: "50 000 – 100 000 MAD" },
  { value: "100 000+ MAD", label: "100 000+ MAD" },
];

type SelectOption = { value: string; label: string };
type AttachmentItem = { id: string; name: string; file?: File; sizeLabel?: string };

const parseDescription = (description: string) => {
  const brandMatch = description.match(/Brand:\s*(.*)/);
  const goalMatch = description.match(/Core Goal:\s*([\s\S]*)/);
  return { brandName: brandMatch?.[1]?.trim() || "", coreGoal: goalMatch?.[1]?.trim() || description };
};

const toAttachmentItem = (file: File): AttachmentItem => ({
  id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name, file, sizeLabel: `${(file.size / 1024).toFixed(1)} KB`,
});

const toExistingAttachmentItem = (name: string, index: number): AttachmentItem => ({ id: `existing-${index}-${name}`, name });

const selectStyles: StylesConfig<SelectOption, boolean> = {
  control: (base, state) => ({ ...base, backgroundColor: "#2D3652", borderColor: state.isFocused ? "#67CFB1" : "#2E3A5C", color: "#fff", padding: "4px", boxShadow: "none", borderRadius: "6px", "&:hover": { borderColor: "#67CFB1" } }),
  menu: (base) => ({ ...base, backgroundColor: "#1e2a42", border: "1px solid #2E3A5C", borderRadius: "8px" }),
  option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#414CC4" : "transparent", color: "white", fontSize: "13px", cursor: "pointer", "&:active": { backgroundColor: "#67CFB1" } }),
  multiValue: (base) => ({ ...base, backgroundColor: "#414CC4", borderRadius: "4px" }),
  multiValueLabel: (base) => ({ ...base, color: "#fff" }),
  multiValueRemove: (base) => ({ ...base, "&:hover": { backgroundColor: "#ff4d4f", color: "white" } }),
  singleValue: (base) => ({ ...base, color: "#fff", fontSize: "13px" }),
  placeholder: (base) => ({ ...base, color: "rgba(255,255,255,0.4)", fontSize: "13px" }),
  input: (base) => ({ ...base, color: "#fff" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? "#67CFB1" : "rgba(255,255,255,0.4)", "&:hover": { color: "#67CFB1" } }),
};

export default function NewProject() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const loading = useAppSelector(selectBriefsLoading);
  const timeZone = getLocalTimeZone();
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const editingBrief = location.state && "brief" in location.state ? (location.state.brief as Brief) : null;
  const isEditing = !!editingBrief;
  const parsedDescription = editingBrief ? parseDescription(editingBrief.description) : null;

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState(editingBrief?.title ?? "");
  const [brandName, setBrandName] = useState(parsedDescription?.brandName ?? "");
  const [coreGoal, setCoreGoal] = useState(parsedDescription?.coreGoal ?? "");
  const [serviceType, setServiceType] = useState<SelectOption | null>(serviceOptions.find(o => o.value === editingBrief?.projectType) ?? null);
  const [features, setFeatures] = useState<SelectOption[]>(editingBrief?.features.map(f => ({ value: f, label: f })) ?? []);
  const [budget, setBudget] = useState<SelectOption | null>(budgetOptions.find(o => o.value === editingBrief?.budgetRange) ?? (editingBrief?.budgetRange ? { value: editingBrief.budgetRange, label: editingBrief.budgetRange } : null));
  const [deadline, setDeadline] = useState<Date | null>(editingBrief?.deadline ? new Date(editingBrief.deadline) : null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>(editingBrief?.attachments.map(toExistingAttachmentItem) ?? []);
  const [success, setSuccess] = useState(false);
  const deadlineValue = deadline ? [fromDate(deadline, timeZone)] : [];

  const isStep1Valid = projectName && brandName && coreGoal && serviceType && features.length > 0;
  const isStep2Valid = budget && deadline;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const nextFiles = Array.from(files).map(toAttachmentItem);
      setAttachments(prev => { const existing = new Set(prev.map(f => f.id)); return [...prev, ...nextFiles.filter(f => !existing.has(f.id))]; });
      e.target.value = "";
    }
  };

  const handleCreate = async () => {
    // Upload any new File objects first, keep existing server filenames as-is
    const newFiles = attachments.filter(a => a.file);
    const existingNames = attachments.filter(a => !a.file).map(a => a.name);

    let uploadedNames: string[] = [];
    if (newFiles.length > 0) {
      const formData = new FormData();
      newFiles.forEach(a => formData.append("files", a.file!));
      const res = await api.post("/briefs/upload", formData, {
        headers: { "Content-Type": undefined },
      });
      uploadedNames = res.data.filenames;
    }

    const payload = {
      title: projectName, projectType: serviceType?.value as ProjectType || "OTHER",
      description: `Brand: ${brandName}\n\nCore Goal: ${coreGoal}`,
      features: features.map(f => f.value), budgetRange: budget?.value || "",
      deadline: deadline ? deadline.toISOString() : new Date().toISOString(),
      attachments: [...existingNames, ...uploadedNames],
    };
    const result = isEditing && editingBrief
      ? await dispatch(updateBriefThunk({ id: editingBrief.id, data: payload }))
      : await dispatch(createBriefThunk(payload));
    const didSucceed = isEditing ? updateBriefThunk.fulfilled.match(result) : createBriefThunk.fulfilled.match(result);
    if (didSucceed) { setSuccess(true); setTimeout(() => navigate("/my-briefs"), 2000); }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <CheckCircle className="text-sbteal w-24 h-24 mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold uppercase tracking-widest text-center text-white mb-4">
          {isEditing ? t("newProject.updated") : t("newProject.submit")}
        </h1>
        <p className="text-white/60">{isEditing ? t("newProject.updatedSubtitle") : t("newProject.submitSubtitle")}</p>
      </div>
    );
  }

  return (
    <section className="font-poppins text-white min-h-[calc(100vh-80px)] flex flex-col items-center pt-16 pb-20 relative overflow-hidden">
      <div className="w-full max-w-[500px] mb-[40px] px-4">
        {step === 1 ? (
          <h1 className="text-white text-[30px] sm:text-[40px] md:text-[50px] lg:text-[58px] font-bold tracking-widest uppercase leading-tight">
            {isEditing ? <>{t("newProject.editProjectTitle").split(" ")[0]} <span className="text-sbteal">{t("newProject.editProjectTitle").split(" ").slice(1).join(" ")}</span></> : <>{t("newProject.projectIdentityTitle").split(" ")[0]} <span className="text-sbteal">{t("newProject.projectIdentityTitle").split(" ").slice(1).join(" ")}</span></>}
          </h1>
        ) : (
          <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] font-bold tracking-widest uppercase leading-tight">
            {t("newProject.additionalInfoTitle").split(" ")[0]} <span className="text-sbteal">{t("newProject.additionalInfoTitle").split(" ").slice(1).join(" ")}</span>
          </h1>
        )}
      </div>

      <div className="w-full max-w-[500px] flex flex-col gap-5 relative z-10 px-4">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
            <input type="text" placeholder={t("newProject.projectNamePlaceholder")} value={projectName} onChange={e => setProjectName(e.target.value)}
              className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors" />
            <input type="text" placeholder={t("newProject.brandNamePlaceholder")} value={brandName} onChange={e => setBrandName(e.target.value)}
              className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors" />
            <textarea placeholder={t("newProject.coreGoalPlaceholder")} value={coreGoal} onChange={e => setCoreGoal(e.target.value)} rows={4}
              className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none" />
            <Select<SelectOption, false> options={serviceOptions} value={serviceType} onChange={val => setServiceType(val)} placeholder={t("newProject.serviceTypePlaceholder")} styles={selectStyles} />
            <Select<SelectOption, true> isMulti options={featureOptions} value={features} onChange={(val: MultiValue<SelectOption>) => setFeatures([...val])} placeholder={t("newProject.featuresPlaceholder")} styles={selectStyles} menuPlacement="top" maxMenuHeight={200} classNamePrefix="feat-sel" />
            <div className="flex justify-between mt-6">
              <button disabled className="bg-[#2D3652] text-white/50 px-8 py-2 rounded-full cursor-not-allowed text-sm font-medium">{t("newProject.previous")}</button>
              <button disabled={!isStep1Valid} onClick={() => setStep(2)}
                className="bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2">
                {t("newProject.next")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
            <Select<SelectOption, false> options={budgetOptions} value={budget} onChange={val => setBudget(val)} placeholder={t("newProject.budgetPlaceholder")} styles={selectStyles} />

            <DatePicker.Root value={deadlineValue} onValueChange={({ value }) => setDeadline(value[0] ? new Date(Date.UTC(value[0].year, value[0].month - 1, value[0].day, 12, 0, 0)) : null)} min={fromDate(new Date(), timeZone)} closeOnSelect positioning={{ placement: "bottom-start" }}>
              <DatePicker.Control className="project-date-picker-control group flex w-full items-center rounded-md border border-[#2E3A5C] bg-[#2D3652] transition-colors focus-within:border-sbteal focus-within:ring-1 focus-within:ring-sbteal">
                <DatePicker.Input placeholder={t("newProject.launchDatePlaceholder")} className="project-date-picker-input border border-[#2E3A5C] w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none" />
                <DatePicker.IndicatorGroup className="pr-3">
                  <DatePicker.Trigger className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white" aria-label="Open calendar">
                    <Calendar className="w-4 h-4" />
                  </DatePicker.Trigger>
                </DatePicker.IndicatorGroup>
              </DatePicker.Control>
              <Portal>
                <DatePicker.Positioner>
                  <DatePicker.Content className="project-date-picker-popup z-50 rounded-xl border border-[#2E3A5C] bg-[#1a2238] p-3 text-white shadow-2xl">
                    <DatePicker.View view="day" className="w-[320px]"><DatePicker.Header className="mb-3" /><DatePicker.DayTable /></DatePicker.View>
                    <DatePicker.View view="month" className="w-[320px]"><DatePicker.Header className="mb-3" /><DatePicker.MonthTable /></DatePicker.View>
                    <DatePicker.View view="year" className="w-[320px]"><DatePicker.Header className="mb-3" /><DatePicker.YearTable /></DatePicker.View>
                  </DatePicker.Content>
                </DatePicker.Positioner>
              </Portal>
            </DatePicker.Root>

            <div className="rounded-md border border-[#2E3A5C] bg-[#2D3652] p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white">{t("newProject.attachments")}</p>
                  <p className="text-xs text-white/50">{t("newProject.attachmentsSubtitle")}</p>
                </div>
                <button type="button" onClick={() => attachmentInputRef.current?.click()}
                  className="bg-sbpurple hover:bg-[#3a44b0] px-4 py-2 rounded-md text-xs font-medium transition-colors shrink-0">
                  {attachments.length > 0 ? t("newProject.addMore") : t("newProject.addFiles")}
                </button>
                <input ref={attachmentInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
              </div>
              <div className="rounded-md bg-[#26304A] px-4 py-5">
                {attachments.length > 0 ? (
                  <div className="attachment-scroll flex max-h-[276px] flex-col gap-3 overflow-y-auto pr-1">
                    {attachments.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="group flex items-center gap-3 rounded-md border border-[#36415F] bg-[#2D3652] px-3 py-3" title={file.name}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sbpurple/20"><UploadCloud className="h-5 w-5 text-sbteal" /></div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{file.name}</p>
                          <p className="text-xs text-white/45">{file.sizeLabel ?? t("newProject.existingAttachment")}</p>
                        </div>
                        <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/35 opacity-0 transition-all hover:bg-white/8 hover:text-white group-hover:opacity-100" aria-label={`Remove ${file.name}`}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-24 items-center justify-center rounded-md text-center text-sm text-white/45">{t("newProject.noAttachment")}</div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="bg-[#2D3652] hover:bg-[#3b466b] text-white px-8 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {t("newProject.previous")}
              </button>
              <button disabled={!isStep2Valid || loading} onClick={handleCreate}
                className="bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-2 rounded-full transition-colors text-sm font-medium">
                {loading ? t("newProject.creating") : t("newProject.create")}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
.project-date-picker-input { color: white !important; caret-color: white; border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; }
.project-date-picker-input:hover, .project-date-picker-input:focus, .project-date-picker-input:focus-visible { border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; }
.project-date-picker-control { border-color: #2E3A5C !important; box-shadow: none !important; outline: none !important; }
.project-date-picker-control:hover { border-color: #2E3A5C !important; }
.project-date-picker-control:focus-within { border-color: #67CFB1 !important; box-shadow: 0 0 0 1px #67CFB1 !important; }
.project-date-picker-input::placeholder { color: rgba(255, 255, 255, 0.4) !important; }
.project-date-picker-popup { min-width: 344px; border-radius: 14px; border: 1px solid #2E3A5C; background: #1A2238; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42); }
.project-date-picker-popup [data-part="view"] { width: 100%; }
.project-date-picker-popup [data-part="view-control"] { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.project-date-picker-popup [data-part="prev-trigger"], .project-date-picker-popup [data-part="next-trigger"], .project-date-picker-popup [data-part="view-trigger"] { border-radius: 8px; color: white !important; transition: background-color 0.2s ease; }
.project-date-picker-popup [data-part="prev-trigger"]:hover, .project-date-picker-popup [data-part="next-trigger"]:hover, .project-date-picker-popup [data-part="view-trigger"]:hover { background: rgba(255, 255, 255, 0.08); }
.project-date-picker-popup [data-part="table"] { width: 100%; border-collapse: separate; border-spacing: 6px; }
.project-date-picker-popup [data-part="table-header"] { color: rgba(255, 255, 255, 0.45) !important; font-size: 12px; font-weight: 500; text-align: center; padding-bottom: 4px; }
.project-date-picker-popup [data-part="table-cell-trigger"] { height: 34px; border: none !important; outline: none !important; box-shadow: none; border-radius: 10px; color: white !important; font-size: 13px; transition: background-color 0.2s ease; }
.project-date-picker-popup [data-part="table-cell-trigger"]:hover { background: rgba(103, 207, 177, 0.18); color: white !important; }
.project-date-picker-popup [data-part="table-cell-trigger"][data-selected] { background: #414CC4; color: white !important; }
.project-date-picker-popup [data-part="table-cell-trigger"][data-today] { box-shadow: inset 0 0 0 1px rgba(103, 207, 177, 0.55); }
.project-date-picker-popup button:focus, .project-date-picker-popup button:focus-visible, .project-date-picker-popup [data-part="table-cell-trigger"]:focus, .project-date-picker-popup [data-part="table-cell-trigger"]:focus-visible { outline: none !important; box-shadow: none; }
.project-date-picker-popup [data-part="table-cell-trigger"][data-outside-range], .project-date-picker-popup [data-part="table-cell-trigger"][data-disabled] { color: rgba(255, 255, 255, 0.28) !important; }
.attachment-scroll { scrollbar-width: thin; scrollbar-color: #414CC4 transparent; }
.attachment-scroll::-webkit-scrollbar { width: 8px; }
.attachment-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #414CC4 0%, #67CFB1 100%); border-radius: 9999px; }
.attachment-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #5560db 0%, #7ae4c5 100%); }
      `}</style>
    </section>
  );
}
