// AuthContext.tsx
import React, {createContext, useContext, useEffect, useState} from "react";
import {db} from "../../firebase/config";
import {doc, getDoc} from "firebase/firestore";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const [role, setRole] = useState<boolean>(false);
    const [reload, setReload] = useState<number>(0);
    const checkAdmin = async () => {

        try {
            if (localStorage.getItem("uid") != null) {
                const userDoc = await getDoc(doc(db, "users", localStorage.getItem("uid")));
                setRole(userDoc.exists() ? userDoc.data().role === "admin" : false);
            }
        }catch (e){
        }
    }
    useEffect(() => {
        console.log("CHECK ADMIN",reload,localStorage.getItem("uid") )
        checkAdmin().then();
    }, [reload]);

    return (
        <AuthContext.Provider value={{role,setReload}}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook dùng trong các component con
export const useAuthLogin = () => useContext(AuthContext);
