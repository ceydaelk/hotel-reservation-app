import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { FavoritesProvider } from "./src/context/FavoritesContext"; // ⭐️

const App = () => {
  return (
    <FavoritesProvider> {/* GLOBAL FAVORITE DURUMU */}
      <AppNavigator />
    </FavoritesProvider>
  );
};

export default App;



