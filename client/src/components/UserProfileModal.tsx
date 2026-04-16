import { useMemo, useState } from "react";
import { Pencil, Save, ShieldAlert, Trash2, UserCircle2, X, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { changePasswordThunk, deleteMeThunk, updateMeThunk } from "../features/auth/authSlice/authThunk";
import { selectAuthError, selectAuthLoading, selectUser } from "../features/auth/authSlice/authSelectors";

type UserProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  if (!isOpen) return null;
  if (!user) return null;

  const isLocal = user.provider === "LOCAL";

  const openEdit = () => {
    setMode("edit");
    setEdit({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
  };

  const handleSaveProfile = async () => {
    const payload = {
      firstName: edit.firstName.trim(),
      lastName: edit.lastName.trim(),
      email: edit.email.trim().toLowerCase(),
      phone: edit.phone.trim(),
    };
    const result = await dispatch(updateMeThunk(payload));
    if (updateMeThunk.fulfilled.match(result)) {
      const data = result.payload as any;
      if (data?.pendingEmailChange) {
        setPendingEmail(edit.email.trim().toLowerCase());
        setMode("view");
      } else {
        setMode("view");
      }
    }
  };

  const handleChangePassword = async () => {
    const result = await dispatch(
      changePasswordThunk({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    );
    if (changePasswordThunk.fulfilled.match(result)) {
      setPasswords({ currentPassword: "", newPassword: "" });
      setMode("view");
    }
  };

  const handleDeleteAccount = async () => {
    const result = await dispatch(deleteMeThunk(isLocal ? { password: deletePassword } : {}));
    if (deleteMeThunk.fulfilled.match(result)) {
      onClose();
      navigate("/");
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-6 sm:p-0">
      <div className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-[820px] max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl border border-[#2E3A5C] bg-[#141B2D] shadow-2xl thin-scrollbar">
        <div className="flex items-center justify-between border-b border-[#2E3A5C]/40 bg-[#141B2D]/80 px-6 py-5 backdrop-blur-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-12 w-12 rounded-2xl border border-[#2E3A5C] bg-[#2D3652] flex items-center justify-center text-white font-black">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-white font-black tracking-widest uppercase text-xs">Account</p>
              <p className="truncate text-white/45 text-[11px] font-mono tracking-[0.18em] uppercase mt-1">
                {user.email}
              </p>
            </div>
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

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-rose-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMode("view")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                mode === "view"
                  ? "bg-sbteal text-[#0F1528] border-sbteal/30"
                  : "bg-[#2D3652]/40 text-white/70 border-[#2E3A5C]/40 hover:bg-[#2D3652]"
              }`}
            >
              <UserCircle2 size={14} className="inline mr-2" /> Profile
            </button>
            <button
              type="button"
              onClick={openEdit}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                mode === "edit"
                  ? "bg-sbpurple text-white border-sbpurple/30"
                  : "bg-[#2D3652]/40 text-white/70 border-[#2E3A5C]/40 hover:bg-[#2D3652]"
              }`}
            >
              <Pencil size={14} className="inline mr-2" /> Edit Info
            </button>
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                mode === "password"
                  ? "bg-[#2d7aa6] text-white border-[#2d7aa6]/40"
                  : "bg-[#2D3652]/40 text-white/70 border-[#2E3A5C]/40 hover:bg-[#2D3652]"
              }`}
            >
              <ShieldAlert size={14} className="inline mr-2" /> Password
            </button>
            <button
              type="button"
              onClick={() => setMode("delete")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                mode === "delete"
                  ? "bg-rose-500/20 text-rose-200 border-rose-500/30"
                  : "bg-[#2D3652]/40 text-white/70 border-[#2E3A5C]/40 hover:bg-[#2D3652]"
              }`}
            >
              <Trash2 size={14} className="inline mr-2" /> Delete
            </button>
          </div>

          {pendingEmail && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
              <Mail size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-amber-200 font-semibold mb-0.5">Confirm your new email</p>
                <p className="text-amber-200/70">A verification link was sent to <span className="text-amber-200 font-medium">{pendingEmail}</span>. Your email won't change until you click it.</p>
                <button onClick={() => setPendingEmail(null)} className="text-amber-400/60 hover:text-amber-400 text-xs mt-2 underline underline-offset-2 transition-colors">Dismiss</button>
              </div>
            </div>
          )}

          {mode === "view" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Name</p>
                <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
              </div>
              <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">User ID</p>
                <p className="text-white/85 font-mono text-xs break-all">{user.id}</p>
              </div>
              <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Email</p>
                <p className="text-white/90">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Phone</p>
                <p className="text-white/90">{user.phone || "N/A"}</p>
              </div>
              <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Role</p>
                <p className="text-white/90">{user.role}</p>
              </div>
              <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Provider</p>
                <p className="text-white/90">{user.provider}</p>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">First Name</label>
                <input
                  value={edit.firstName}
                  onChange={(e) => setEdit((p) => ({ ...p, firstName: e.target.value }))}
                  disabled={loading}
                  className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Last Name</label>
                <input
                  value={edit.lastName}
                  onChange={(e) => setEdit((p) => ({ ...p, lastName: e.target.value }))}
                  disabled={loading}
                  className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Email</label>
                <input
                  value={edit.email}
                  onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                  disabled={loading}
                  className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Phone</label>
                <input
                  value={edit.phone}
                  onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                  disabled={loading}
                  className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-sbpurple hover:bg-[#3a44b0] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-sbpurple/30 transition-all flex items-center gap-2"
                >
                  <Save size={16} /> {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {mode === "password" && (
            <div className="rounded-2xl border border-[#2E3A5C]/40 bg-[#1A2238]/30 p-5">
              {!isLocal ? (
                <p className="text-white/60 text-sm">
                  This account uses Google sign-in. Password changes are managed by Google.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                      disabled={loading}
                      className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 uppercase tracking-widest text-[10px] font-bold mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                      disabled={loading}
                      className="w-full bg-[#2D3652] border border-[#2E3A5C] rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sbteal transition-colors disabled:opacity-60"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-[#2d7aa6] hover:bg-[#2a6c94] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-[#2d7aa6]/40 transition-all"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "delete" && (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5">
              <p className="text-rose-100 text-sm mb-4">
                This will permanently delete your account. This action cannot be undone.
              </p>
              {isLocal && (
                <div className="mb-4">
                  <label className="block text-rose-100/70 uppercase tracking-widest text-[10px] font-bold mb-2">
                    Confirm With Password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-[#2D3652] border border-rose-500/25 rounded-md px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-rose-400 transition-colors disabled:opacity-60"
                    placeholder="Your password"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading || (isLocal && !deletePassword)}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> {loading ? "Deleting..." : "Delete My Account"}
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

