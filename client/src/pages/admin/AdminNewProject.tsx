import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker, Portal } from "@chakra-ui/react";
import { fromDate, getLocalTimeZone } from "@internationalized/date";
import Select from "react-select";
import type { MultiValue, StylesConfig } from "react-select";
import { CheckCircle, UserPlus, ArrowRight, ArrowLeft, Calendar, UploadCloud, X, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import authApi from "../../features/auth/api/authAxios";
import briefApi from "../../features/briefs/api/briefAxios";
import AddClientModal, { type AdminClient } from "../../components/admin/AddClientModal";
import type { ProjectType } from "../../features/briefs/briefSlice/briefTypes";

type SelectOption = { value: string; label: string };
type AttachmentItem = { id: string; name: string; file?: File; sizeLabel?: string };

const serviceOptions: SelectOption[] = [
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

const featureOptions: SelectOption[] = [
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

const budgetOptions: SelectOption[] = [
    { value: "3 000 – 10 000 MAD", label: "3 000 – 10 000 MAD" },
    { value: "10 000 – 25 000 MAD", label: "10 000 – 25 000 MAD" },
    { value: "25 000 – 50 000 MAD", label: "25 000 – 50 000 MAD" },
    { value: "50 000 – 100 000 MAD", label: "50 000 – 100 000 MAD" },
    { value: "100 000+ MAD", label: "100 000+ MAD" },
];

const selectStyles: StylesConfig<SelectOption, boolean> = {
    control: (base, state) => ({
        ...base,
        backgroundColor: "#2D3652",
        borderColor: state.isFocused ? "#67CFB1" : "#2E3A5C",
        color: "#fff",
        padding: "4px",
        boxShadow: "none",
        borderRadius: "6px",
        "&:hover": { borderColor: "#67CFB1" },
    }),
    menu: (base) => ({ ...base, backgroundColor: "#1e2a42", border: "1px solid #2E3A5C", borderRadius: "8px" }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#414CC4" : "transparent",
        color: "white",
        fontSize: "13px",
        cursor: "pointer",
        "&:active": { backgroundColor: "#67CFB1" },
    }),
    multiValue: (base) => ({ ...base, backgroundColor: "#414CC4", borderRadius: "4px" }),
    multiValueLabel: (base) => ({ ...base, color: "#fff" }),
    multiValueRemove: (base) => ({ ...base, "&:hover": { backgroundColor: "#ff4d4f", color: "white" } }),
    singleValue: (base) => ({ ...base, color: "#fff", fontSize: "13px" }),
    placeholder: (base) => ({ ...base, color: "rgba(255,255,255,0.4)", fontSize: "13px" }),
    input: (base) => ({ ...base, color: "#fff" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? "#67CFB1" : "rgba(255,255,255,0.4)",
        "&:hover": { color: "#67CFB1" },
    }),
};

const toAttachmentItem = (file: File): AttachmentItem => ({
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    file,
    sizeLabel: `${(file.size / 1024).toFixed(1)} KB`,
});

type View = "clients" | "form";

export default function AdminNewProject() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const timeZone = getLocalTimeZone();
    const attachmentInputRef = useRef<HTMLInputElement | null>(null);

    const [view, setView] = useState<View>("clients");
    const [clients, setClients] = useState<AdminClient[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Brief form state
    const [step, setStep] = useState(1);
    const [projectName, setProjectName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [coreGoal, setCoreGoal] = useState("");
    const [serviceType, setServiceType] = useState<SelectOption | null>(null);
    const [features, setFeatures] = useState<SelectOption[]>([]);
    const [budget, setBudget] = useState<SelectOption | null>(null);
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const deadlineValue = deadline ? [fromDate(deadline, timeZone)] : [];
    const isStep1Valid = projectName && brandName && coreGoal && serviceType && features.length > 0;
    const isStep2Valid = budget && deadline;

    useEffect(() => {
        authApi.get("/auth/admin/clients")
            .then((res) => setClients(res.data))
            .catch(() => {})
            .finally(() => setClientsLoading(false));
    }, []);

    const handleClientCreated = (client: AdminClient) => {
        setClients((prev) => [client, ...prev]);
    };

    const handleSelectClient = (client: AdminClient) => {
        setSelectedClient(client);
        setView("form");
        setStep(1);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(toAttachmentItem);
            setAttachments((prev) => {
                const existing = new Set(prev.map((f) => f.id));
                return [...prev, ...newFiles.filter((f) => !existing.has(f.id))];
            });
            e.target.value = "";
        }
    };

    const handleCreate = async () => {
        if (!selectedClient) return;
        setSubmitting(true);
        try {
            // Upload new files first
            const newFiles = attachments.filter(a => a.file);
            const existingNames = attachments.filter(a => !a.file).map(a => a.name);
            let uploadedNames: string[] = [];
            if (newFiles.length > 0) {
                const formData = new FormData();
                newFiles.forEach(a => formData.append("files", a.file!));
                const res = await briefApi.post("/briefs/upload", formData, {
                    headers: { "Content-Type": undefined },
                });
                uploadedNames = res.data.filenames;
            }

            await briefApi.post(`/briefs/admin/for-client/${selectedClient.id}`, {
                title: projectName,
                projectType: serviceType?.value as ProjectType || "OTHER",
                description: `Brand: ${brandName}\n\nCore Goal: ${coreGoal}`,
                features: features.map((f) => f.value),
                budgetRange: budget?.value || "",
                deadline: deadline ? deadline.toISOString() : new Date().toISOString(),
                attachments: [...existingNames, ...uploadedNames],
            });
            setSuccess(true);
            setTimeout(() => navigate("/briefs"), 2000);
        } catch (err: any) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
                <CheckCircle className="text-sbteal w-24 h-24 mb-6 animate-bounce" />
                <h1 className="text-4xl font-bold uppercase tracking-widest text-center text-white mb-4">{t("adminProject.briefCreated")}</h1>
                <p className="text-white/60">{t("adminProject.briefCreatedFor")} {selectedClient?.firstName} {selectedClient?.lastName}.</p>
            </div>
        );
    }

    // ── Client selection view ──
    if (view === "clients") {
        return (
            <section className="font-poppins text-white min-h-[calc(100vh-80px)] pt-16 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-[30px] sm:text-[40px] font-bold tracking-widest uppercase leading-tight">
                            {t("adminProject.selectClientTitle").split(" ").slice(0, -1).join(" ")}{" "}
                            <span className="text-sbteal">{t("adminProject.selectClientTitle").split(" ").slice(-1)}</span>
                        </h1>
                        <p className="text-white/50 text-sm mt-2">{t("adminProject.selectClientSubtitle")}</p>
                    </div>

                    {clientsLoading ? (
                        <div className="text-white/40 text-sm">{t("adminProject.loadingClients")}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Add new client card */}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#2E3A5C] hover:border-sbpurple/60 bg-transparent hover:bg-sbpurple/5 transition-all p-8 text-white/40 hover:text-white/70 min-h-[140px]"
                            >
                                <UserPlus size={28} />
                                <span className="text-sm font-medium">{t("adminProject.addClient")}</span>
                            </button>

                            {clients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => handleSelectClient(client)}
                                    className="flex flex-col gap-3 rounded-2xl border border-[#2E3A5C] hover:border-sbpurple/60 bg-[#0F1528]/50 hover:bg-sbpurple/5 transition-all p-5 text-left min-h-[140px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sbpurple/20 border border-sbpurple/30">
                                            <User size={16} className="text-sbpurple" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate">
                                                {client.firstName} {client.lastName}
                                            </p>
                                            <p className={`text-[11px] truncate ${client.isPlaceholderEmail ? "text-amber-400/70" : "text-white/40"}`}>
                                                {client.email}
                                            </p>
                                        </div>
                                    </div>
                                    {client.phone && (
                                        <p className="text-white/35 text-xs">{client.phone}</p>
                                    )}
                                    <div className="mt-auto flex items-center gap-1.5 text-sbpurple/70 text-xs font-medium">
                                        {t("adminProject.createBrief")} <ArrowRight size={12} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {showAddModal && (
                    <AddClientModal
                        onClose={() => setShowAddModal(false)}
                        onCreated={handleClientCreated}
                    />
                )}
            </section>
        );
    }

    // ── Brief form view ──
    return (
        <section className="font-poppins text-white min-h-[calc(100vh-80px)] flex flex-col items-center pt-16 pb-20 relative overflow-hidden px-4">
            {/* Client banner */}
            <div className="w-full max-w-[500px] mb-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#2E3A5C]/60 bg-[#0F1528]/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sbpurple/20">
                        <User size={13} className="text-sbpurple" />
                    </div>
                    <p className="text-white/60 text-xs">
                        {t("adminProject.creatingFor")} <span className="text-white font-semibold">{selectedClient?.firstName} {selectedClient?.lastName}</span>
                    </p>
                    <button
                        onClick={() => setView("clients")}
                        className="ml-auto text-white/30 hover:text-white/70 transition-colors text-[11px] underline underline-offset-2"
                    >
                        {t("adminProject.change")}
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="w-full max-w-[500px] mb-[32px]">
                {step === 1 ? (
                    <h1 className="text-white text-[30px] sm:text-[40px] md:text-[50px] font-bold tracking-widest uppercase leading-tight">
                        {t("newProject.projectIdentityTitle").split(" ").slice(0, -1).join(" ")}{" "}
                        <span className="text-sbteal">{t("newProject.projectIdentityTitle").split(" ").slice(-1)}</span>
                    </h1>
                ) : (
                    <h1 className="text-white text-[28px] sm:text-[36px] md:text-[44px] font-bold tracking-widest uppercase leading-tight">
                        {t("newProject.additionalInfoTitle").split(" ").slice(0, -1).join(" ")}{" "}
                        <span className="text-sbteal">{t("newProject.additionalInfoTitle").split(" ").slice(-1)}</span>
                    </h1>
                )}
            </div>

            <div className="w-full max-w-[500px] flex flex-col gap-5 relative z-10">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
                        <input
                            type="text"
                            placeholder={t("newProject.projectNamePlaceholder")}
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors"
                        />
                        <input
                            type="text"
                            placeholder={t("newProject.brandNamePlaceholder")}
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors"
                        />
                        <textarea
                            placeholder={t("newProject.coreGoalPlaceholder")}
                            value={coreGoal}
                            onChange={(e) => setCoreGoal(e.target.value)}
                            rows={4}
                            className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none"
                        />
                        <Select<SelectOption, false>
                            options={serviceOptions}
                            value={serviceType}
                            onChange={(val) => setServiceType(val)}
                            placeholder={t("newProject.serviceTypePlaceholder")}
                            styles={selectStyles}
                        />
                        <Select<SelectOption, true>
                            isMulti
                            options={featureOptions}
                            value={features}
                            onChange={(val: MultiValue<SelectOption>) => setFeatures([...val])}
                            placeholder={t("newProject.featuresPlaceholder")}
                            styles={selectStyles}
                            menuPlacement="top"
                            maxMenuHeight={200}
                        />
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setView("clients")}
                                className="bg-[#2D3652] hover:bg-[#3b466b] text-white px-8 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> {t("briefDetails.back")}
                            </button>
                            <button
                                disabled={!isStep1Valid}
                                onClick={() => setStep(2)}
                                className="bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                {t("newProject.next")} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
                        <Select<SelectOption, false>
                            options={budgetOptions}
                            value={budget}
                            onChange={(val) => setBudget(val)}
                            placeholder={t("newProject.budgetPlaceholder")}
                            styles={selectStyles}
                        />

                        <DatePicker.Root
                            value={deadlineValue}
                            onValueChange={({ value }) => setDeadline(value[0] ? new Date(Date.UTC(value[0].year, value[0].month - 1, value[0].day, 12, 0, 0)) : null)}
                            min={fromDate(new Date(), timeZone)}
                            closeOnSelect
                            positioning={{ placement: "bottom-start" }}
                        >
                            <DatePicker.Control className="anp-dp-control group flex w-full items-center rounded-md border border-[#2E3A5C] bg-[#2D3652] transition-colors focus-within:border-sbteal focus-within:ring-1 focus-within:ring-sbteal">
                                <DatePicker.Input
                                    placeholder={t("newProject.launchDatePlaceholder")}
                                    className="anp-dp-input border border-[#2E3A5C] w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none"
                                />
                                <DatePicker.IndicatorGroup className="pr-3">
                                    <DatePicker.Trigger className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white" aria-label="Open calendar">
                                        <Calendar className="w-4 h-4" />
                                    </DatePicker.Trigger>
                                </DatePicker.IndicatorGroup>
                            </DatePicker.Control>
                            <Portal>
                                <DatePicker.Positioner>
                                    <DatePicker.Content className="anp-dp-popup z-50 rounded-xl border border-[#2E3A5C] bg-[#1a2238] p-3 text-white shadow-2xl">
                                        <DatePicker.View view="day" className="w-[320px]">
                                            <DatePicker.Header className="mb-3" />
                                            <DatePicker.DayTable />
                                        </DatePicker.View>
                                        <DatePicker.View view="month" className="w-[320px]">
                                            <DatePicker.Header className="mb-3" />
                                            <DatePicker.MonthTable />
                                        </DatePicker.View>
                                        <DatePicker.View view="year" className="w-[320px]">
                                            <DatePicker.Header className="mb-3" />
                                            <DatePicker.YearTable />
                                        </DatePicker.View>
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
                                <button
                                    type="button"
                                    onClick={() => attachmentInputRef.current?.click()}
                                    className="bg-sbpurple hover:bg-[#3a44b0] px-4 py-2 rounded-md text-xs font-medium transition-colors shrink-0"
                                >
                                    {attachments.length > 0 ? t("newProject.addMore") : t("newProject.addFiles")}
                                </button>
                                <input ref={attachmentInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                            </div>
                            <div className="rounded-md bg-[#26304A] px-4 py-5">
                                {attachments.length > 0 ? (
                                    <div className="anp-attachment-scroll flex max-h-[276px] flex-col gap-3 overflow-y-auto pr-1">
                                        {attachments.map((file, i) => (
                                            <div key={file.id} className="group flex items-center gap-3 rounded-md border border-[#36415F] bg-[#2D3652] px-3 py-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sbpurple/20">
                                                    <UploadCloud className="h-5 w-5 text-sbteal" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm text-white">{file.name}</p>
                                                    <p className="text-xs text-white/45">{file.sizeLabel}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                                                    className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/35 opacity-0 transition-all hover:bg-white/8 hover:text-white group-hover:opacity-100"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-24 items-center justify-center text-sm text-white/45">{t("newProject.noAttachment")}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="bg-[#2D3652] hover:bg-[#3b466b] text-white px-8 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> {t("newProject.previous")}
                            </button>
                            <button
                                disabled={!isStep2Valid || submitting}
                                onClick={handleCreate}
                                className="bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-2 rounded-full transition-colors text-sm font-medium"
                            >
                                {submitting ? t("adminProject.creatingBrief") : t("adminProject.createBriefBtn")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
.anp-dp-input {
    color: white !important;
    caret-color: white;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
}
.anp-dp-input:hover, .anp-dp-input:focus, .anp-dp-input:focus-visible {
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
}
.anp-dp-input::placeholder { color: rgba(255,255,255,0.4) !important; }
.anp-dp-control { border-color: #2E3A5C !important; box-shadow: none !important; }
.anp-dp-control:hover { border-color: #2E3A5C !important; }
.anp-dp-control:focus-within { border-color: #67CFB1 !important; box-shadow: 0 0 0 1px #67CFB1 !important; }
.anp-dp-popup { min-width: 344px; border-radius: 14px; border: 1px solid #2E3A5C; background: #1A2238; box-shadow: 0 24px 60px rgba(0,0,0,0.42); }
.anp-dp-popup [data-part="view"] { width: 100%; }
.anp-dp-popup [data-part="view-control"] { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
.anp-dp-popup [data-part="prev-trigger"], .anp-dp-popup [data-part="next-trigger"], .anp-dp-popup [data-part="view-trigger"] { border-radius: 8px; color: white !important; transition: background-color 0.2s ease; }
.anp-dp-popup [data-part="prev-trigger"]:hover, .anp-dp-popup [data-part="next-trigger"]:hover, .anp-dp-popup [data-part="view-trigger"]:hover { background: rgba(255,255,255,0.08); }
.anp-dp-popup [data-part="table"] { width:100%; border-collapse:separate; border-spacing:6px; }
.anp-dp-popup [data-part="table-header"] { color:rgba(255,255,255,0.45) !important; font-size:12px; font-weight:500; text-align:center; padding-bottom:4px; }
.anp-dp-popup [data-part="table-cell-trigger"] { height:34px; border:none !important; outline:none !important; box-shadow:none; border-radius:10px; color:white !important; font-size:13px; transition:background-color 0.2s ease; }
.anp-dp-popup [data-part="table-cell-trigger"]:hover { background:rgba(103,207,177,0.18); color:white !important; }
.anp-dp-popup [data-part="table-cell-trigger"][data-selected] { background:#414CC4; color:white !important; }
.anp-dp-popup [data-part="table-cell-trigger"][data-today] { box-shadow:inset 0 0 0 1px rgba(103,207,177,0.55); }
.anp-dp-popup button:focus, .anp-dp-popup button:focus-visible, .anp-dp-popup [data-part="table-cell-trigger"]:focus { outline:none !important; box-shadow:none; }
.anp-dp-popup [data-part="table-cell-trigger"][data-outside-range], .anp-dp-popup [data-part="table-cell-trigger"][data-disabled] { color:rgba(255,255,255,0.28) !important; }
.anp-attachment-scroll { scrollbar-width:thin; scrollbar-color:#414CC4 transparent; }
.anp-attachment-scroll::-webkit-scrollbar { width:8px; }
.anp-attachment-scroll::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#414CC4 0%,#67CFB1 100%); border-radius:9999px; }
      `}</style>
        </section>
    );
}
