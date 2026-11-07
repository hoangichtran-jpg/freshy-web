import {
  useCallback,
  useMemo,
  useState,
} from "react";

export const useOrderFilters = ({ orders }) => {
  const [searchText, setSearchText] = useState("");

  const filteredOrders = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const searchableFields = [
        order.orderId,
        order.unit,
        order.address,
        order.agencyPhone,
      ]
        .filter(Boolean)
        .map((value) =>
          String(value).toLowerCase(),
        );

      return searchableFields.some((field) =>
        field.includes(query),
      );
    });
  }, [orders, searchText]);

  const searchOrders = useCallback((value) => {
    setSearchText(value || "");
  }, []);

  const clearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  return {
    filteredOrders,
    searchText,
    searchOrders,
    clearSearch,
  };
};