import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import authApi from "../../features/auth/api/authAxios";
import { useAppDispatch } from "../../app/hooks";
import { getMeThunk } from "../../features/auth/authSlice/authThunk";
import { useTranslation } from "react-i18next";

export default function VerifyEmailChange() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage(t("auth.verifyEmailChange.noToken"));
            return;
        }

        authApi.get(`/auth/verify-email-change?token=${token}`)
            .then(() => {
                setStatus("success");
                dispatch(getMeThunk());
            })
            .catch((err) => {
                setStatus("error");
                setMessage(err.response?.data?.message || t("auth.verifyEmailChange.defaultError"));
            });
    }, [token]);

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4">
            {status === "loading" && (
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-sbpurple animate-spin" />
                    <p className="text-white/60 text-sm">{t("auth.verifyEmailChange.verifying")}</p>
                </div>
            )}
            {status === "success" && (
                <div className="flex flex-col items-center gap-4 text-center">
                    <CheckCircle className="w-16 h-16 text-sbteal" />
                    <h1 className="text-white text-2xl font-bold tracking-widest uppercase">{t("auth.verifyEmailChange.successTitle")}</h1>
                    <p className="text-white/60 text-sm max-w-xs">{t("auth.verifyEmailChange.successMessage")}</p>
                    <button onClick={() => navigate("/")}
                        className="mt-4 bg-sbpurple hover:bg-[#3a44b0] transition-colors text-white px-8 py-2.5 rounded-full text-sm font-medium">
                        {t("auth.verifyEmailChange.goHome")}
                    </button>
                </div>
            )}
            {status === "error" && (
                <div className="flex flex-col items-center gap-4 text-center">
                    <XCircle className="w-16 h-16 text-rose-400" />
                    <h1 className="text-white text-2xl font-bold tracking-widest uppercase">{t("auth.verifyEmailChange.errorTitle")}</h1>
                    <p className="text-white/60 text-sm max-w-xs">{message}</p>
                    <button onClick={() => navigate("/")}
                        className="mt-4 bg-[#2D3652] hover:bg-[#3b466b] transition-colors text-white px-8 py-2.5 rounded-full text-sm font-medium">
                        {t("auth.verifyEmailChange.goHome")}
                    </button>
                </div>
            )}
        </div>
    );
}
