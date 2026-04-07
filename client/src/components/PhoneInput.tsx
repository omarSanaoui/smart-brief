import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, value, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex w-full", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value || undefined}
      onChange={(nextValue) => onChange?.(nextValue || ("" as RPNInput.Value))}
      {...props}
    />
  );
});

PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-[50px] w-full rounded-r-md border border-l-0 border-[#2E3A5C] bg-[#2D3652] px-4 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-[#414CC4]",
      className,
    )}
    {...props}
  />
));

InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options,
  onChange,
}: CountrySelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = options.filter((option) => {
    if (!option.value) return false;
    const term = searchValue.trim().toLowerCase();
    if (!term) return true;
    const code = `+${RPNInput.getCountryCallingCode(option.value)}`;
    return option.label.toLowerCase().includes(term) || code.includes(term);
  });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-[50px] min-w-[82px] items-center gap-1 rounded-l-md border border-r-0 border-[#2E3A5C] bg-[#27304B] px-3 text-white transition-colors hover:bg-[#313B58] disabled:cursor-not-allowed"
      >
        <FlagComponent country={selectedCountry} countryName={selectedCountry} />
        <span className="text-xs text-white/80">
          +{RPNInput.getCountryCallingCode(selectedCountry)}
        </span>
        <span className="text-[10px] text-white/60">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[56px] z-30 w-[395px] max-w-[calc(100vw-48px)] rounded-md border border-[#354066] bg-[#1D253E] p-2 shadow-[0_20px_40px_rgba(4,8,25,0.6)]">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search country..."
            className="mb-2 h-10 w-full rounded-md border border-[#2E3A5C] bg-[#2B3556] px-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#414CC4]"
          />

          <div className="phone-country-scroll max-h-[320px] overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="px-2 py-2 text-sm text-white/50">No country found.</p>
            )}

            {filtered.map((option) => {
              const country = option.value;
              if (!country) return null;
              const dialCode = `+${RPNInput.getCountryCallingCode(country)}`;
              const isSelected = country === selectedCountry;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setIsOpen(false);
                    setSearchValue("");
                  }}
                  className={cn(
                    "mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-[#2B3556] text-white"
                      : "text-white/90 hover:bg-[#26304B]",
                  )}
                >
                  <FlagComponent
                    country={country}
                    countryName={option.label}
                  />
                  <span className="flex-1 truncate">{option.label}</span>
                  <span className="text-white/55">{dialCode}</span>
                  <span className={cn("text-xs", isSelected ? "opacity-100" : "opacity-0")}>✓</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-white/20">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
