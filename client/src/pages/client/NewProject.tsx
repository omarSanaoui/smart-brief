import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createBriefThunk } from "../../features/briefs/briefSlice/briefThunk";
import { selectBriefsLoading } from "../../features/briefs/briefSlice/briefSelectors";
import type { ProjectType } from "../../features/briefs/briefSlice/briefTypes";
import { UploadCloud, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const serviceOptions = [
  { value: "WEB", label: "Web App" },
  { value: "MOBILE", label: "Mobile App" },
  { value: "UI_UX", label: "UI/UX Design" },
  { value: "BRANDING", label: "Branding" },
  { value: "OTHER", label: "E-commerce / Other" },
];

const featureOptions = [
  { value: "Login System", label: "Login System" },
  { value: "Payment Gateway", label: "Payment Gateway" },
  { value: "Real-Time Chat", label: "Real-Time Chat" },
  { value: "Dashboard", label: "Admin Dashboard" },
  { value: "Analytics", label: "Analytics" },
  { value: "Social Login", label: "Social Login" },
  { value: "Email Notifications", label: "Email Notifications" },
];

const budgetOptions = [
  { value: "$1,000 - $5,000", label: "$1,000 - $5,000" },
  { value: "$5,000 - $10,000", label: "$5,000 - $10,000" },
  { value: "$10,000 - $20,000", label: "$10,000 - $20,000" },
  { value: "$20,000+", label: "$20,000+" },
];

// Dark theme styles for react-select
import type { StylesConfig } from "react-select";

const selectStyles: StylesConfig<any, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#2D3652",
    borderColor: state.isFocused ? "#67CFB1" : "#2E3A5C",
    color: "#fff",
    padding: "4px",
    boxShadow: "none",
    "&:hover": { borderColor: "#67CFB1" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#2D3652",
    border: "1px solid #2E3A5C",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#414CC4" : "transparent",
    color: "white",
    cursor: "pointer",
    "&:active": { backgroundColor: "#67CFB1" },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#414CC4",
    color: "#fff",
    borderRadius: "4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#fff",
  }),
  multiValueRemove: (base) => ({
    ...base,
    "&:hover": { backgroundColor: "#ff4d4f", color: "white" },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.4)",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
};

export default function NewProject() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(selectBriefsLoading);

  const [step, setStep] = useState(1);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [coreGoal, setCoreGoal] = useState("");
  const [serviceType, setServiceType] = useState<{value:string;label:string} | null>(null);
  const [features, setFeatures] = useState<Array<{value:string;label:string}>>([]);
  const [budget, setBudget] = useState<{value:string;label:string} | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [success, setSuccess] = useState(false);

  const isStep1Valid = projectName && brandName && coreGoal && serviceType;
  const isStep2Valid = budget && deadline;

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleCreate = async () => {
    // Combine fields for the backend payload
    const payload = {
      title: projectName,
      projectType: serviceType?.value as ProjectType || "WEB",
      description: `Brand: ${brandName}\n\nCore Goal: ${coreGoal}`,
      features: features.map(f => f.value),
      budgetRange: budget?.value || "",
      deadline: deadline ? deadline.toISOString() : new Date().toISOString(),
      // We will skip actual file uploads to S3 here and just mock attachment strings for the demo
      attachments: attachments.map(a => a.name)
    };

    const result = await dispatch(createBriefThunk(payload));
    if (createBriefThunk.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/my-briefs");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <CheckCircle className="text-sbteal w-24 h-24 mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold uppercase tracking-widest text-center text-white mb-4">
          Brief Submitted!
        </h1>
        <p className="text-white/60">We'll review your project and get back to you shortly.</p>
      </div>
    );
  }

  return (
    <section className="font-poppins text-white min-h-[calc(100vh-80px)] flex flex-col items-center pt-16 pb-20 relative overflow-hidden">
      {/* Title */}
      <div className="w-full max-w-[500px] mb-[40px] px-4">
        {step === 1 ? (
          <h1 className="text-white text-[48px] md:text-[58px] font-bold tracking-widest uppercase leading-tight">
            PROJECT <span className="text-sbteal">IDENTITY</span>
          </h1>
        ) : (
          <h1 className="text-white text-[44px] md:text-[52px] font-bold tracking-widest uppercase leading-tight">
            ADDITIONAL <span className="text-sbteal">INFORMATIONS</span>
          </h1>
        )}
      </div>

      <div className="w-full max-w-[500px] flex flex-col gap-5 relative z-10 px-4">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
            <input
              type="text"
              placeholder="Project Name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors"
            />

            <input
              type="text"
              placeholder="Company/Brand Name..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors"
            />

            <textarea
              placeholder="Core Goal..."
              value={coreGoal}
              onChange={(e) => setCoreGoal(e.target.value)}
              rows={4}
              className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors resize-none"
            />

            <Select
              options={serviceOptions}
              value={serviceType}
              onChange={setServiceType}
              placeholder="Service Type"
              styles={selectStyles}
            />

            <Select
              isMulti
              options={featureOptions}
              value={features}
              onChange={(val) => setFeatures(val as any)}
              placeholder="Must-Have Features"
              styles={selectStyles}
            />

            <div className="flex justify-between mt-6">
              <button
                disabled
                className="bg-[#2D3652] text-white/50 px-8 py-2 rounded-full cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <button
                disabled={!isStep1Valid}
                onClick={handleNext}
                className="bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col gap-5">
            <Select
              options={budgetOptions}
              value={budget}
              onChange={setBudget}
              placeholder="Budget Range"
              styles={selectStyles}
            />

            <div className="relative w-full">
              <DatePicker
                selected={deadline}
                onChange={(date: Date | null) => setDeadline(date)}
                placeholderText="Desired Launch Date"
                minDate={new Date()}
                className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors"
                wrapperClassName="w-full"
                calendarClassName="bg-[#2D3652] text-white border-[#2E3A5C]"
              />
            </div>

            <div className="flex justify-between items-center bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3">
              <span className="text-white/60 text-sm">Attachments (Brand, References...)</span>
              <label className="cursor-pointer bg-sbpurple hover:bg-[#3a44b0] px-4 py-1.5 rounded-md text-xs font-medium transition-colors">
                Add
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            {/* Display Attachment placeholders (just squares for demo like the image) */}
            <div className="flex gap-3 overflow-x-auto py-2">
              {attachments.length > 0 ? (
                attachments.map((file, i) => (
                  <div key={i} className="w-[60px] h-[60px] shrink-0 bg-[#E0E0E0] rounded-md flex items-center justify-center flex-col overflow-hidden shadow-sm" title={file.name}>
                    <UploadCloud className="w-5 h-5 text-gray-500" />
                    <span className="text-[8px] text-gray-600 truncate w-full px-1 text-center mt-1">{file.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="w-[60px] h-[60px] shrink-0 bg-[#E0E0E0] rounded-md"></div>
                  <div className="w-[60px] h-[60px] shrink-0 bg-[#E0E0E0] rounded-md"></div>
                  <div className="w-[60px] h-[60px] shrink-0 bg-[#E0E0E0] rounded-md"></div>
                  <div className="w-[60px] h-[60px] shrink-0 bg-[#E0E0E0] rounded-md"></div>
                </>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="bg-[#2D3652] hover:bg-[#3b466b] text-white px-8 py-2 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={!isStep2Valid || loading}
                onClick={handleCreate}
                className="bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-2 rounded-full transition-colors text-sm font-medium"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Overriding some datepicker default text colors for dark mode */
        .react-datepicker__header {
           background-color: #1a2238; border-bottom: 1px solid #2E3A5C;
        }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
           color: white;
        }
        .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
           color: white;
        }
        .react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__quarter-text:hover, .react-datepicker__year-text:hover {
           background-color: #67CFB1; color: black;
        }
        .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range, .react-datepicker__month-text--selected, .react-datepicker__month-text--in-selecting-range, .react-datepicker__month-text--in-range, .react-datepicker__quarter-text--selected, .react-datepicker__quarter-text--in-selecting-range, .react-datepicker__quarter-text--in-range, .react-datepicker__year-text--selected, .react-datepicker__year-text--in-selecting-range, .react-datepicker__year-text--in-range {
           background-color: #414CC4;
        }
      `}</style>
    </section>
  );
}
