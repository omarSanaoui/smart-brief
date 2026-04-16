import { useState } from "react";
import { X, Copy, Check, User, Download } from "lucide-react";
import authApi from "../../features/auth/api/authAxios";

export interface AdminClient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isPlaceholderEmail: boolean;
    createdAt: string;
}

interface Props {
    onClose: () => void;
    onCreated: (client: AdminClient) => void;
}

export default function AddClientModal({ onClose, onCreated }: Props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<{ client: AdminClient; password: string } | null>(null);
    const [copied, setCopied] = useState<"email" | "password" | null>(null);

    const handleDownload = () => {
        const content = [
            `Smart Brief — Client Credentials`,
            ``,
            `Name:     ${created!.client.firstName} ${created!.client.lastName}`,
            `Email:    ${created!.client.email}`,
            `Password: ${created!.password}`,
            ``,
            `Login at: ${window.location.origin}/login`,
        ].join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `credentials-${created!.client.firstName.toLowerCase()}-${created!.client.lastName.toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = (text: string, field: "email" | "password") => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await authApi.post("/auth/admin/create-client", {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
            });
            setCreated({ client: res.data.user, password: res.data.generatedPassword });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create client");
        } finally {
            setLoading(false);
        }
    };

    if (created) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={() => { onCreated(created.client); onClose(); }} />
                <div className="relative w-full max-w-md rounded-2xl border border-[#2E3A5C] bg-[#141B2D] p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-bold text-lg">Client Created</h2>
                        <button onClick={() => { onCreated(created.client); onClose(); }} className="text-white/40 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <p className="text-white/60 text-sm mb-5">
                        Save these credentials — the password won't be shown again.
                    </p>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between rounded-xl border border-[#2E3A5C] bg-[#0F1528]/60 px-4 py-3">
                            <div>
                                <p className="text-white/40 text-[11px] uppercase tracking-wide mb-0.5">Email</p>
                                <p className="text-white text-sm font-medium">{created.client.email}</p>
                            </div>
                            <button onClick={() => handleCopy(created.client.email, "email")} className="text-white/40 hover:text-sbteal transition-colors ml-3">
                                {copied === "email" ? <Check size={16} className="text-sbteal" /> : <Copy size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-[#2E3A5C] bg-[#0F1528]/60 px-4 py-3">
                            <div>
                                <p className="text-white/40 text-[11px] uppercase tracking-wide mb-0.5">Password</p>
                                <p className="text-white text-sm font-mono font-medium">{created.password}</p>
                            </div>
                            <button onClick={() => handleCopy(created.password, "password")} className="text-white/40 hover:text-sbteal transition-colors ml-3">
                                {copied === "password" ? <Check size={16} className="text-sbteal" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 flex-1 bg-[#1e2a42] hover:bg-[#263350] transition-colors text-white/70 hover:text-white py-2.5 rounded-xl text-sm font-medium border border-[#2E3A5C]"
                        >
                            <Download size={15} /> Download
                        </button>
                        <button
                            onClick={() => { onCreated(created.client); onClose(); }}
                            className="flex-1 bg-sbpurple hover:bg-[#3a44b0] transition-colors text-white py-2.5 rounded-xl text-sm font-medium"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-[#2E3A5C] bg-[#141B2D] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sbpurple/20 border border-sbpurple/30">
                            <User size={16} className="text-sbpurple" />
                        </div>
                        <h2 className="text-white font-bold text-lg">Add Client</h2>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="First Name *"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="bg-[#1e2a42] border border-[#2E3A5C] rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Last Name *"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="bg-[#1e2a42] border border-[#2E3A5C] rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="Email (optional — auto-generated if blank)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1e2a42] border border-[#2E3A5C] rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors"
                        />
                        {!email && firstName && lastName && (
                            <p className="text-white/35 text-[11px] mt-1.5 ml-1">
                                Will be: {firstName.toLowerCase()}.{lastName.toLowerCase()}@client.agence47.ma
                            </p>
                        )}
                    </div>

                    <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#1e2a42] border border-[#2E3A5C] rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sbteal transition-colors"
                    />

                    {error && <p className="text-rose-400 text-sm">{error}</p>}

                    <div className="flex gap-3 mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-[#1e2a42] hover:bg-[#263350] text-white/70 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !firstName || !lastName}
                            className="flex-1 bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                            {loading ? "Creating..." : "Create Client"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
