import {useState} from "react";
import {GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup} from "firebase/auth";
import {auth} from "../firebase/config";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("token", token);
            localStorage.setItem("uid", userCredential.user.uid)
            // @ts-ignore
            localStorage.setItem("email", userCredential.user.email)
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }

    };


    const loginWithGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            localStorage.setItem("token", token);
            localStorage.setItem("uid", result.user.uid)
            // @ts-ignore
            localStorage.setItem("email", result.user.email)
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };
    return {loginWithGoogle, login, loading, error, setError};
}
