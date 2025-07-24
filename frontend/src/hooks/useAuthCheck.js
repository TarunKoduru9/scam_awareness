import { useState, useEffect } from "react";
import { getToken } from "../utils/api";

const useAuthCheck = () => {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      setLoggedIn(!!token);
      setLoading(false);
    };
    checkToken();
  }, []);

  return { loading, loggedIn, setLoggedIn };
};

export default useAuthCheck;
