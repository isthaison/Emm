import React from 'react'
export type StoreState = {
    me?: firebase.User;
    s2?: string;
    dispatchStore?: (pay: StoreState) => void;
  };
  export const initialState: StoreState = {};

  export const Store = React.createContext(initialState);