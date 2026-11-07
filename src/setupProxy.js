const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    "/api/v1",
    createProxyMiddleware({
      target: "https://dev.freshy.vn",
      changeOrigin: true,
      secure: true,
      ws: true,
    }),
  );
};
