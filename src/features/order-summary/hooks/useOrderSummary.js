import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getOrdersSummaryByStatus,
} from "../api";


const hasValidPosId = (
  posId,
) => {
  return (
    posId !== null &&
    posId !== undefined &&
    posId !== ""
  );
};


const mergeUniqueOrders = (
  currentOrders,
  incomingOrders,
) => {
  const seenOrderIds =
    new Set();


  return [
    ...currentOrders,
    ...incomingOrders,
  ].filter(
    (order) => {
      if (
        order?.orderId ===
          null ||
        order?.orderId ===
          undefined
      ) {
        return true;
      }


      const orderId =
        String(
          order.orderId,
        );


      if (
        seenOrderIds.has(
          orderId,
        )
      ) {
        return false;
      }


      seenOrderIds.add(
        orderId,
      );


      return true;
    },
  );
};


export const useOrderSummary = ({
  status,
  posId,
  pageSize = 10,
}) => {
  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    hasMore,
    setHasMore,
  ] = useState(true);


  /*
   * Dùng request id để response cũ
   * không overwrite context mới.
   */
  const requestIdRef =
    useRef(0);


  /*
   * Page tiếp theo không cần
   * làm React state.
   */
  const nextPageRef =
    useRef(0);


  /*
   * Chặn nhiều request pagination
   * chạy đồng thời.
   */
  const loadingRef =
    useRef(false);


  /*
   * loadMore() luôn đọc được
   * hasMore mới nhất.
   */
  const hasMoreRef =
    useRef(true);


  const fetchPage =
    useCallback(
      async (
        page,
        {
          replace = false,
        } = {},
      ) => {
        if (
          !status ||
          !hasValidPosId(
            posId,
          )
        ) {
          if (replace) {
            setOrders([]);
          }


          setLoading(false);
          setLoadingMore(false);

          setError(null);

          setHasMore(false);

          hasMoreRef.current =
            false;


          return null;
        }


        if (
          loadingRef.current
        ) {
          return null;
        }


        const requestId =
          ++requestIdRef.current;


        loadingRef.current =
          true;


        if (
          page === 0
        ) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }


        setError(null);


        try {
          const data =
            await getOrdersSummaryByStatus(
              status,
              posId,
              page,
              pageSize,
            );


          /*
           * Request này đã stale.
           */
          if (
            requestId !==
            requestIdRef.current
          ) {
            return null;
          }


          const incomingOrders =
            Array.isArray(
              data,
            )
              ? data
              : [];


          if (replace) {
            setOrders(
              mergeUniqueOrders(
                [],
                incomingOrders,
              ),
            );
          } else {
            setOrders(
              (
                currentOrders,
              ) =>
                mergeUniqueOrders(
                  currentOrders,
                  incomingOrders,
                ),
            );
          }


          /*
           * Giữ behavior hiện tại:
           *
           * backend trả page rỗng
           * thì mới coi là hết dữ liệu.
           */
          const canLoadMore =
            incomingOrders.length >
            0;


          hasMoreRef.current =
            canLoadMore;


          setHasMore(
            canLoadMore,
          );


          nextPageRef.current =
            page + 1;


          return incomingOrders;
        } catch (err) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return null;
          }


          setError(
            err,
          );


          if (replace) {
            setOrders([]);
          }


          return null;
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            loadingRef.current =
              false;


            if (
              page === 0
            ) {
              setLoading(false);
            } else {
              setLoadingMore(
                false,
              );
            }
          }
        }
      },
      [
        pageSize,
        posId,
        status,
      ],
    );


  const refresh =
    useCallback(
      async () => {
        /*
         * Invalidate request cũ.
         */
        requestIdRef.current +=
          1;


        loadingRef.current =
          false;

        nextPageRef.current =
          0;

        hasMoreRef.current =
          true;


        setOrders([]);

        setError(null);

        setHasMore(true);

        setLoadingMore(false);


        if (
          !status ||
          !hasValidPosId(
            posId,
          )
        ) {
          setLoading(false);

          setHasMore(false);

          hasMoreRef.current =
            false;


          return null;
        }


        return fetchPage(
          0,
          {
            replace: true,
          },
        );
      },
      [
        fetchPage,
        posId,
        status,
      ],
    );


  const loadMore =
    useCallback(
      async () => {
        if (
          loadingRef.current ||
          !hasMoreRef.current ||
          !status ||
          !hasValidPosId(
            posId,
          )
        ) {
          return null;
        }


        return fetchPage(
          nextPageRef.current,
          {
            replace: false,
          },
        );
      },
      [
        fetchPage,
        posId,
        status,
      ],
    );


  useEffect(() => {
    refresh();


    return () => {
      /*
       * Dependency đổi hoặc unmount:
       * response đang chạy trở thành stale.
       */
      requestIdRef.current +=
        1;

      loadingRef.current =
        false;
    };
  }, [
    refresh,
  ]);


  return {
    orders,

    loading,
    loadingMore,

    error,

    hasMore,

    loadMore,
    refresh,
  };
};