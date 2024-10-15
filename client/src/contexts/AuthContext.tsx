import React, {
    createContext, useContext, useEffect, useState
} from "react";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import firebaseApp from "../services/firebase-config";

interface AuthContext {
    currentUser: User | null;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const auth = getAuth(firebaseApp);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, [auth]);

    return (
        <AuthContext.Provider value = {{ currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContext => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used with an AuthProvider");
    }
    return context;
}