/* ========================================
   API configuration

   Frontend only communicates
   through the current origin.

   Production:
   https://freshy.vn/api/v1/...

   Nginx routes /api/v1/*
   to the backend service.
======================================== */

export const API_BASE_URL = process.env.REACT_API_BASE_URL;

/* ========================================
   Order realtime
======================================== */

const websocketProtocol =
   window.location.protocol === "https:" ? "wss:" : "ws:";

export const ORDER_REALTIME_URL = `${websocketProtocol}//${process.env.REACT_API_HOST}/api/v1/order-update/admin`;
