import { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppContextProvider');
    }
    return context;
};

const AppContextProvider = (props) => {
    const currencySymbol = '₹';
    const [doctors] = useState([]); // Empty array as we're not fetching doctors anymore

    const value = {
        doctors,
        currencySymbol,
        isAuthenticated: false, // Static value since we're not using auth
        userData: null, // No user data needed
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider