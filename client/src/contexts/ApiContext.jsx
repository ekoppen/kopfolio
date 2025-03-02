import React, { createContext, useContext } from 'react';
import api from '../utils/api';

// Create the API context
const ApiContext = createContext();

// Provider component
export const ApiProvider = ({ children }) => {
// API methods
const updateMenuOrder = async (pages) => {
    try {
    const response = await api.put('/pages/menu/order', { pages });
    return response.data;
    } catch (error) {
    console.error('Error updating menu order:', error);
    throw error;
    }
};

const updateSubOrder = async (pages) => {
    try {
    const response = await api.put('/pages/sub-order', { pages });
    return response.data;
    } catch (error) {
    console.error('Error updating sub order:', error);
    throw error;
    }
};

// Value object with all API methods
const apiValue = {
    updateMenuOrder,
    updateSubOrder
};

return (
    <ApiContext.Provider value={apiValue}>
    {children}
    </ApiContext.Provider>
);
};

// Custom hook for using the API context
export const useApi = () => {
const context = useContext(ApiContext);
if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
}
return context;
};

export default ApiContext;

