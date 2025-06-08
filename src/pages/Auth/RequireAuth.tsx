import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [checking, setChecking] = useState(true);
    const [valid, setValid] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken(true);
                    setValid(!!token);
                } catch {
                    setValid(false);
                }
            } else {
                setValid(false);
            }
            setChecking(false);
        });
        return () => unsubscribe();
    }, []);

    if (checking) return null; // hoặc loading spinner

    if (!valid) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <>{children}</>;
};

export default RequireAuth;
