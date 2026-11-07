import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  toppingGroupGetAll,
} from "../api";


export default function useToppingGroups() {
  const [
    toppingGroups,
    setToppingGroups,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  const fetchToppingGroups =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await toppingGroupGetAll();

          const list =
            Array.isArray(response)
              ? response
              : [];

          setToppingGroups(
            list,
          );

          return list;
        } catch (requestError) {
          setError(
            requestError,
          );

          setToppingGroups(
            [],
          );

          throw requestError;
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    fetchToppingGroups().catch(
      () => {},
    );
  }, [
    fetchToppingGroups,
  ]);


  return {
    toppingGroups,

    loading,
    error,

    refresh:
      fetchToppingGroups,
  };
}