import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path"; // 需要引入 path 模块
import components from "unplugin-vue-components/vite";
import { AntDesignXVueResolver } from "ant-design-x-vue/resolver";

export default defineConfig({
  base: "/design",
  plugins: [
    vue(),
    components({
      resolvers: [AntDesignXVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 把 @ 指向 src 目录
      components: path.resolve(__dirname, "./src/components"), // 示例：components 别名
      assets: path.resolve(__dirname, "./src/assets"), // 示例：assets 别名
    },
  },
  server: {
    host: "0.0.0.0",
    port: 4000,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8888",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "design",
    target: "es2015",
    minify: true,
  },
});
