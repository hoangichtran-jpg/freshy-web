import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  exportAllOrdersByDate,
  exportAllOrdersByDateRange,
  exportOrdersByUnitAndDate,
  exportOrdersByUnitAndDateRange,
  getOrderSummaryUnits,
} from "../api";


const EXPORT_OPTION = {
  ALL: "all",
  UNIT: "unit",
};


const EXPORT_TYPE = {
  DATE: "date",
  RANGE_DATE:
    "range-date",
};


const normalizeUnits = (
  data,
) => {
  if (
    !Array.isArray(
      data,
    )
  ) {
    return [];
  }


  return Array.from(
    new Set(
      data.filter(
        (unit) =>
          typeof unit ===
            "string" &&
          unit.trim() !== "",
      ),
    ),
  );
};


export const useOrderSummaryExport = ({
  status,
  posId,
  enabled = false,
}) => {
  const [
    units,
    setUnits,
  ] = useState([]);

  const [
    loadingUnits,
    setLoadingUnits,
  ] = useState(false);

  const [
    unitsError,
    setUnitsError,
  ] = useState(null);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [
    exportError,
    setExportError,
  ] = useState(null);


  /*
   * Bảo vệ unit request cũ.
   *
   * Ví dụ:
   * mở modal ở POS A
   * → request A
   *
   * đổi sang POS B
   * → request B
   *
   * nếu A về sau B,
   * A không được overwrite units của B.
   */
  const unitsRequestIdRef =
    useRef(0);


  /*
   * Button loading đã chặn phần lớn
   * double click.
   *
   * Ref này là lớp bảo vệ thứ hai
   * ở logic layer.
   */
  const exportingRef =
    useRef(false);


  const refreshUnits =
    useCallback(
      async () => {
        const requestId =
          ++unitsRequestIdRef.current;


        if (
          !enabled ||
          posId === null ||
          posId === undefined ||
          posId === ""
        ) {
          setUnits([]);

          setUnitsError(
            null,
          );

          setLoadingUnits(
            false,
          );

          return [];
        }


        setLoadingUnits(
          true,
        );

        setUnitsError(
          null,
        );


        try {
          const data =
            await getOrderSummaryUnits(
              posId,
            );


          if (
            requestId !==
            unitsRequestIdRef.current
          ) {
            return [];
          }


          const nextUnits =
            normalizeUnits(
              data,
            );


          setUnits(
            nextUnits,
          );


          return nextUnits;
        } catch (error) {
          if (
            requestId !==
            unitsRequestIdRef.current
          ) {
            return [];
          }


          setUnits([]);

          setUnitsError(
            error,
          );


          return [];
        } finally {
          if (
            requestId ===
            unitsRequestIdRef.current
          ) {
            setLoadingUnits(
              false,
            );
          }
        }
      },
      [
        enabled,
        posId,
      ],
    );


  useEffect(() => {
    refreshUnits();


    return () => {
      unitsRequestIdRef.current +=
        1;
    };
  }, [
    refreshUnits,
  ]);


  const exportOrders =
    useCallback(
      async ({
        unit,
        exportOption,
        type,
        startDate,
        endDate,
      }) => {
        if (
          exportingRef.current
        ) {
          return null;
        }


        if (!status) {
          throw new Error(
            "Không xác định được trạng thái đơn hàng.",
          );
        }


        if (
          posId === null ||
          posId === undefined ||
          posId === ""
        ) {
          throw new Error(
            "Không xác định được vị trí (posId).",
          );
        }


        if (
          exportOption !==
            EXPORT_OPTION.ALL &&
          exportOption !==
            EXPORT_OPTION.UNIT
        ) {
          throw new Error(
            "Kiểu xuất Excel không hợp lệ.",
          );
        }


        if (
          type !==
            EXPORT_TYPE.DATE &&
          type !==
            EXPORT_TYPE.RANGE_DATE
        ) {
          throw new Error(
            "Kiểu thời gian xuất Excel không hợp lệ.",
          );
        }


        if (
          exportOption ===
            EXPORT_OPTION.UNIT &&
          !unit
        ) {
          throw new Error(
            "Vui lòng chọn đơn vị.",
          );
        }


        if (
          type ===
            EXPORT_TYPE.DATE &&
          !startDate
        ) {
          throw new Error(
            "Vui lòng chọn ngày.",
          );
        }


        if (
          type ===
            EXPORT_TYPE.RANGE_DATE &&
          (
            !startDate ||
            !endDate
          )
        ) {
          throw new Error(
            "Vui lòng chọn khoảng thời gian.",
          );
        }


        exportingRef.current =
          true;

        setExporting(
          true,
        );

        setExportError(
          null,
        );


        try {
          if (
            exportOption ===
            EXPORT_OPTION.ALL
          ) {
            if (
              type ===
              EXPORT_TYPE.DATE
            ) {
              await exportAllOrdersByDate({
                status,
                posId,
                date:
                  startDate,
              });
            } else {
              await exportAllOrdersByDateRange({
                status,
                posId,
                startDate,
                endDate,
              });
            }
          } else if (
            type ===
            EXPORT_TYPE.DATE
          ) {
            await exportOrdersByUnitAndDate({
              status,
              unit,
              posId,
              date:
                startDate,
            });
          } else {
            await exportOrdersByUnitAndDateRange({
              status,
              unit,
              posId,
              startDate,
              endDate,
            });
          }


          /*
           * Hook trả về thông tin nghiệp vụ.
           *
           * UI tự quyết định text
           * notification.
           */
          return {
            exportOption,
            type,
          };
        } catch (error) {
          setExportError(
            error,
          );


          throw error;
        } finally {
          exportingRef.current =
            false;

          setExporting(
            false,
          );
        }
      },
      [
        posId,
        status,
      ],
    );


  return {
    units,
    loadingUnits,
    unitsError,

    exporting,
    exportError,

    refreshUnits,
    exportOrders,
  };
};