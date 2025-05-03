import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { FavoritesProvider } from "./src/context/FavoritesContext";

const App = () => {
  return (
    <FavoritesProvider> 
      <AppNavigator />
    </FavoritesProvider>
  );
};

export default App;



