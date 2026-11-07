import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getItemActive,
} from "../api";


export default function useItems() {
  const [
    items,
    setItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  const fetchItems =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await getItemActive();

          const list =
            Array.isArray(response)
              ? response
              : [];

          setItems(list);

          return list;
        } catch (requestError) {
          setError(
            requestError,
          );

          setItems([]);

          throw requestError;
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    fetchItems().catch(
      () => {},
    );
  }, [
    fetchItems,
  ]);


  const updateItemLocal =
    useCallback(
      (
        itemId,
        patch,
      ) => {
        setItems(
          (previous) =>
            previous.map(
              (item) =>
                item.itemId ===
                itemId
                  ? {
                      ...item,
                      ...patch,
                    }
                  : item,
            ),
        );
      },
      [],
    );


  const removeItemLocal =
    useCallback(
      (
        itemId,
        itemName,
      ) => {
        setItems(
          (previous) =>
            previous.filter(
              (item) => {
                if (
                  itemId != null
                ) {
                  return (
                    item.itemId !==
                    itemId
                  );
                }

                return (
                  item.name !==
                  itemName
                );
              },
            ),
        );
      },
      [],
    );


  return {
    items,

    loading,
    error,

    refresh:
      fetchItems,

    setItems,
    updateItemLocal,
    removeItemLocal,
  };
}