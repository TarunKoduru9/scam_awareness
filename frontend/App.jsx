import React, {useEffect} from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthContext } from "./src/utils/AuthContext";
import useAuthCheck from "./src/hooks/useAuthCheck";
import { registerForPushNotificationsAsync } from "./src/utils/pushNotifications";
import { savePushToken } from "./src/utils/api";

export default function App() {
  const { loading, loggedIn, setLoggedIn } = useAuthCheck();

 /* useEffect(() => {
    const setupPush = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushToken(token);
      }
    };

    if (loggedIn) {
      setupPush();
    }
  }, [loggedIn]);*/

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      <NavigationContainer>
        <AppNavigator loading={loading} loggedIn={loggedIn} />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
