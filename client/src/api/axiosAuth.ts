import axios from 'axios'

const AuthApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {"Content-Type": "application/json"}
})

AuthApi.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config
})

AuthApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if(err.response?.status === 401){
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href = "/login"
        }
        return Promise.reject(err)
    } 
)

export default AuthApi