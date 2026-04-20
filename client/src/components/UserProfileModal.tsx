import { useMemo, useState } from "react";
import { Pencil, Save, ShieldAlert, Trash2, UserCircle2, X, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { changePasswordThunk, deleteMeThunk, updateMeThunk } from "../features/auth/authSlice/authThunk";
import { selectAuthError, selectAuthLoading, selectUser } from "../features/auth/authSlice/authSelectors";
import { useTranslation } from "react-i18next";

type UserProfileModalProps = { isOpen: boolean; onClose: () => void };

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [mode, setMode] = useState<"view" | "edit" | "password" | "delete">("view");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [edit, setEdit] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [deletePassword, setDeletePassword] = useState("");

  const initials = useMemo(() => {
    const first = user?.firstName?.[0] ?? "";
    const last = user?.lastName?.[0] ?? "";
    return (first + last).toUpperCase() || "U";
  }, [user?.firstName, user?.lastName]);

  if (!isOpen || !user) return null;

  const isLocal = user.provider === "LOCAL";

  const openEdit = () => {
    setMode("edit");
    setEdit({ firstName: user.firstName ?? "", lastName: user.lastName ?? "", email: user.email ?? "", phone: user.phone ?? "" });
  };

  const handleSaveProfile = async () => {
    const payload = { firstName: edit.firstName.trim(), lastName: edit.lastName.trim(), email: edit.email.trim().toLowerCase(), phone: edit.phone.trim() };
    const result = await dispatch(updateMeThunk(payload));
    if (updateMeThunk.fulfilled.match(result)) {
      const data = result.payload as any;
      if (data?.pendingEmailChange) setPendingEmail(edit.email.trim().toLowerCase());
      setMode("view");
    }
  };

  const handleChangePassword = async () => {
    const result = await dispatch(changePasswordThunk({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }));
    if (changePasswordThunk.fulfilled.match(result)) {
      setPasswords({ currentPassword: "", newPassword: "" });
      setMode("view");
    }
  };

  const handleDeleteAccount = async () => {
    const result = await dispatch(deleteMeThunk(isLocal ? { password: deletePassword } : {}));
    if (deleteMeThunk.fulfilled.match(result)) { onClose(); navigate("/"); }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-6 sm:p-0">
      <div className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-[820px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-[#2E3A5C] bg-[#141B2D] shadow-2xl thin-scrollbar">
        <div className="flex items-center justify-between border-b border-[#2E3A5C]/40 bg-[#141B2D]/80 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-2xl border border-[#2E3A5C] bg-[#2D3652] flex items-center justify-center text-white font-black">{initials}</div>
            <div className="min-w-0">
              <p className="truncate text-white font-black tracking-widest uppercase text-xs">{t("profile.account")}</p>
              <p className="truncate text-white/45 text-[11px] font-mono tracking-[0.18em] uppercase mt-1">{user.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D3652]/40 text-white/40 hover:bg-[#2D3652] hover:text-white transition-all border border-[#2E3A5C]/40"
            aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && <div className="mb-5 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-rose-200 text-sm">{error}</div>}

          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: "view", label: t("profile.profile"), icon: <UserCircle2 size={14} className="inline mr-2" />, activeClass: "bg-sbteal text-[#0F1528] border-sbteal/30", onClick: () => setMode("view") },
              { key: "edit", label: t("profile.editInfo"), icon: <Pencil size={14} className="inline mr-2" />, activeClass: "bg-sbpurple text-white border-sbpurple/30", onClick: openEdit },
              { key: "password", label: t("profile.password"), icon: <ShieldAlert size={14} className="inline mr-2" />, activeClass: "bg-[#2d7aa6] text-white border-[#2d7aa6]/40", onClick: () => setMode("password") },
              { key: "delete", label: t("profile.delete"), icon: <Trash2 size={14} className="inline mr-2" />, activeClass: "bg-rose-500/20 text-rose-200 border-rose-500/30", onClick: () => setMode("delete") },
            ].map(({ key, label, icon, activeClass, onClick }) => (
              <button key={key} type="button" onClick={onClick}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${mode === key ? activeClass : "bg-[#2D3652]/40 text-white/70 border-[#2E3A5C]/40 hover:bg-[#2D3652]"}`}>
                {icon}{label}
              </button>
            ))}
          </div>

          {pendingEmail && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
              <Mail size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-amber-200 font-semibold mb-0.5">{t("profile.pendingEmail")}</p>
                <p className="text-amber-200/70">{t("profile.pendingEmailDesc", { email: pendingEmail })}</p>
                <button onClick={() => setPendingEmail(null)} className="text-amber-400/60 hover:text-amber-400 text-xs mt-2 underline underline-offset-2 transition-colors">{t("profile.dismiss")}</button>
              </div>
            </div>
          )}

          {mode === "view" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: t("profile.name"), value: `${user.firstName} ${user.lastName}` },
                { label: t("profile.userId"), value: user.id, mono: true },
                { label: t("profile.email"), value: user.email },
                { label: t("profile.phone"), value: user.phone || "N/A" },
                { label: t("profile.role"), value: user.role },
                { label: t("profile.provider"), value: user.provider },
              ].map(({ label, value, mono }) => (
                <div key={label} className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                  <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">{label}</p>
                  <p className={`${mono ? "text-white/85 font-mono text-xs break-all" : "text-white font-semibold"}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {mode === "edit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {([["firstName", t("profile.firstName")], ["lastName", t("profile.lastName")], ["email", t("profile.email")], ["phone", t("profile.phone")]] as [keyof typeof edit, string][]).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">{label}</label>
                  <input value={edit[field]} onChange={(e) => setEdit(p => ({ ...p, [field]: e.target.value }))} disabled={loading}
                    className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60" />
                </div>
              ))}
              <div className="md:col-span-2 flex justify-end">
                <button type="button" onClick={handleSaveProfile} disabled={loading}
                  className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-sbpurple/30 transition-all flex items-center gap-2">
                  <Save size={16} /> {loading ? t("profile.saving") : t("profile.save")}
                </button>
              </div>
            </div>
          )}

          {mode === "password" && (
            <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
              {!isLocal ? (
                <p className="text-white/60 text-sm">{t("profile.googlePasswordNote")}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">{t("profile.currentPassword")}</label>
                    <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} disabled={loading}
                      className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60" />
                  </div>
                  <div>
                    <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">{t("profile.newPassword")}</label>
                    <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} disabled={loading}
                      className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60" />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="button" onClick={handleChangePassword} disabled={loading}
                      className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-[#2d7aa6] hover:bg-[#2a6c94] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-[#2d7aa6]/40 transition-all">
                      {loading ? t("profile.updating") : t("profile.updatePassword")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "delete" && (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5">
              <p className="text-rose-100 text-sm mb-4">{t("profile.deleteWarning")}</p>
              {isLocal && (
                <div className="mb-4">
                  <label className="block text-rose-100/70 uppercase tracking-widest text-[10px] font-bold mb-2">{t("profile.confirmWithPassword")}</label>
                  <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} disabled={loading}
                    placeholder={t("profile.passwordPlaceholder")}
                    className="w-full bg-[#2D3652] border border-rose-500/25 rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-rose-400 transition-colors disabled:opacity-60" />
                </div>
              )}
              <button type="button" onClick={handleDeleteAccount} disabled={loading || (isLocal && !deletePassword)}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                <Trash2 size={16} /> {loading ? t("profile.deleting") : t("profile.deleteAccount")}
              </button>
            </div>
          )}
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
