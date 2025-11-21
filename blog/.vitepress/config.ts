import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue Vapor Runtime 函数研究",
  description: "vapor 编译模板后的运行时探秘",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "介绍", link: "/intro" },
    ],

    sidebar: [
      {
        text: "Vapor 运行时函数",
        items: [
          { text: "模板绑定", link: "/binds/" },
          { text: "事件绑定", link: "/events" },
          { text: "组件", link: "/components" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/shenjunjian/vue-vapor-runtime-helper-study",
      },
    ],
  },

  lastUpdated: true,
  markdown: {
    toc: { level: [2, 3, 4] },
  },
  base: "/vue-vapor-runtime-helper-study/",
});
