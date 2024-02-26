const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        target: "https://api.alegra.com",
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
    },
  },
});
