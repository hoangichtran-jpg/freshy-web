import { Client } from "@stomp/stompjs";

import {
  ORDER_REALTIME_URL,
} from "../../../shared/api/apiConfig";

/* ========================================
   Create realtime client
======================================== */

export const createOrderRealtimeClient = ({
  token,
  posIds,
  onEvent,
  onConnected,
  onDisconnected,
  onError,
}) => {
  const brokerURL =
  ORDER_REALTIME_URL;

  const uniquePosIds = Array.from(
    new Set(
      (posIds || [])
        .filter(
          (posId) => posId !== null && posId !== undefined && posId !== "",
        )
        .map(String),
    ),
  );

  const client = new Client({
    brokerURL,

    /*
     * Backend hiện tại có 2 nơi đọc JWT:
     *
     * JwtChannelInterceptor:
     * simpConnectMessage...?token=...
     *
     * WebSocketEventListener:
     * Authorization: Bearer ...
     *
     * Vì vậy tạm thời gửi cả hai.
     *
     * Đây là backend compatibility
     * constraint, không phải pattern
     * frontend mong muốn lâu dài.
     */
    connectHeaders: {
      Authorization: `Bearer ${token}`,

      simpConnectMessage: `${brokerURL}?token=${encodeURIComponent(token)}`,
    },

    reconnectDelay: 5000,

    heartbeatIncoming: 10000,

    heartbeatOutgoing: 10000,
  });

  /* ========================================
       Connected
    ======================================== */

  client.onConnect = () => {
    uniquePosIds.forEach((posId) => {
      const destination = `/topic/order-update/admin/pos/${posId}`;

      client.subscribe(destination, (message) => {
        try {
          const event = JSON.parse(message.body);

          onEvent?.(event);
        } catch (error) {
          console.error("[ORDER REALTIME] invalid message", error);
        }
      });
    });

    onConnected?.();
  };

  /* ========================================
       STOMP error
    ======================================== */

  client.onStompError = (frame) => {
    console.error(
      "[ORDER REALTIME] STOMP error",
      frame.headers?.message || frame.body,
    );

    onError?.(frame);
  };

  /* ========================================
       WebSocket error
    ======================================== */

  client.onWebSocketError = (error) => {
    console.error("[ORDER REALTIME] WebSocket error", error);

    onError?.(error);
  };

  /* ========================================
       Disconnected
    ======================================== */

  client.onWebSocketClose = () => {
    onDisconnected?.();
  };

  return client;
};
