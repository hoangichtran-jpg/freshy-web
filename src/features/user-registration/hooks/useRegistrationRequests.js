import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  getRegistrationTypeConfig,
} from "../constants/registrationTypes";

import {
  getInitialRegistrationRequests,
} from "../data/registrationRequests";


/*
 * Hiện registration chưa có backend API thật.
 *
 * Hook này đang dùng local mock state để giữ
 * interface của feature ổn định.
 *
 * Sau này khi có API:
 *
 * Page
 *   ↓
 * useRegistrationRequests
 *   ↓
 * registrations.api
 *
 * Page/component không cần biết data đến từ
 * mock hay backend.
 */
function useRegistrationRequests(
  type,
) {
  const config =
    getRegistrationTypeConfig(
      type,
    );


  const [
    requests,
    setRequests,
  ] = useState(
    () =>
      getInitialRegistrationRequests(
        type,
      ),
  );


  const [
    searchValue,
    setSearchValue,
  ] = useState("");


  const [
    processingId,
    setProcessingId,
  ] = useState(null);


  const [
    processingAction,
    setProcessingAction,
  ] = useState(null);


  /*
   * Chuẩn hóa search để hỗ trợ tốt
   * tiếng Việt và tránh lỗi khi field null.
   */
  const normalizedSearch =
    searchValue
      .trim()
      .toLocaleLowerCase(
        "vi",
      );


  const filteredRequests =
    useMemo(
      () => {
        if (
          !normalizedSearch
        ) {
          return requests;
        }


        return requests.filter(
          (
            request,
          ) => {
            const searchableText = [
              request?.name,
              request?.phone,
              request?.address,
            ]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase(
                "vi",
              );


            return searchableText.includes(
              normalizedSearch,
            );
          },
        );
      },
      [
        requests,
        normalizedSearch,
      ],
    );


  /*
   * Dùng một helper duy nhất để remove request
   * khỏi danh sách pending sau khi xử lý.
   *
   * Với registration list, request đã approve
   * hoặc reject đều không còn thuộc trạng thái
   * "chờ duyệt".
   */
  const removePendingRequest =
    useCallback(
      (
        requestId,
      ) => {
        setRequests(
          (
            previous,
          ) =>
            previous.filter(
              (
                request,
              ) =>
                request.id !==
                requestId,
            ),
        );
      },
      [],
    );


  /*
   * Mock approve.
   *
   * Chưa gọi backend vì repository hiện không
   * có API approve registration thật.
   *
   * Hàm vẫn là async để consumer sau này không
   * phải đổi interface khi nối API.
   */
  const approveRequest =
    useCallback(
      async (
        request,
      ) => {
        if (
          !request?.id
        ) {
          throw new Error(
            "Không xác định được yêu cầu đăng ký.",
          );
        }


        setProcessingId(
          request.id,
        );

        setProcessingAction(
          "approve",
        );


        try {
          removePendingRequest(
            request.id,
          );


          return request;
        } finally {
          setProcessingId(
            null,
          );

          setProcessingAction(
            null,
          );
        }
      },
      [
        removePendingRequest,
      ],
    );


  /*
   * Mock reject.
   *
   * Tương tự approve: request đã bị từ chối
   * sẽ rời khỏi danh sách đang chờ xử lý.
   */
  const rejectRequest =
    useCallback(
      async (
        request,
      ) => {
        if (
          !request?.id
        ) {
          throw new Error(
            "Không xác định được yêu cầu đăng ký.",
          );
        }


        setProcessingId(
          request.id,
        );

        setProcessingAction(
          "reject",
        );


        try {
          removePendingRequest(
            request.id,
          );


          return request;
        } finally {
          setProcessingId(
            null,
          );

          setProcessingAction(
            null,
          );
        }
      },
      [
        removePendingRequest,
      ],
    );


  const resetSearch =
    useCallback(
      () => {
        setSearchValue("");
      },
      [],
    );


  /*
   * Chỉ phục vụ mock/local state hiện tại.
   *
   * Sau khi có backend API, function này có thể
   * được thay bằng fetchRequests/refetch.
   */
  const resetRequests =
    useCallback(
      () => {
        setRequests(
          getInitialRegistrationRequests(
            type,
          ),
        );
      },
      [
        type,
      ],
    );


  return {
    config,

    requests,

    filteredRequests,

    total:
      requests.length,

    filteredTotal:
      filteredRequests.length,

    searchValue,

    processingId,

    processingAction,

    isProcessing:
      processingId !==
      null,

    setSearchValue,

    resetSearch,

    approveRequest,

    rejectRequest,

    resetRequests,
  };
}


export default useRegistrationRequests;