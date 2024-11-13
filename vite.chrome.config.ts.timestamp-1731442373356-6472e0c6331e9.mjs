// vite.chrome.config.ts
import { crx } from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/@crxjs+vite-plugin@2.0.0-beta.28/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import { defineConfig as defineConfig2 } from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/vite@5.4.10_@types+node@22.8.4_sass@1.80.5_terser@5.36.0/node_modules/vite/dist/node/index.js";

// manifest.chrome.config.ts
import { defineManifest } from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/@crxjs+vite-plugin@2.0.0-beta.28/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.config.ts
import { env } from "node:process";

// package.json
var package_default = {
  dependencies: {
    idb: "^8.0.0",
    marked: "^14.1.3",
    mathjs: "^13.2.0",
    pinia: "^2.2.4",
    vue: "^3.5.12",
    "vue-router": "^4.4.5",
    "webextension-polyfill": "^0.12.0"
  },
  description: "A Vue 3 + Vite project for building Chrome extensions",
  devDependencies: {
    "@antfu/eslint-config": "^3.8.0",
    "@crxjs/vite-plugin": "^2.0.0-beta.28",
    "@iconify-json/mdi": "^1.2.1",
    "@tailwindcss/forms": "^0.5.9",
    "@tailwindcss/typography": "^0.5.15",
    "@types/eslint": "^9.6.1",
    "@types/node": "^22.7.8",
    "@types/webextension-polyfill": "^0.12.1",
    "@vitejs/plugin-vue": "^5.1.4",
    "@vue/compiler-sfc": "^3.5.12",
    "@vueuse/core": "^11.1.0",
    autoprefixer: "^10.4.20",
    "chrome-types": "^0.1.312",
    concurrently: "^9.0.1",
    "cross-env": "^7.0.3",
    daisyui: "^4.12.13",
    eslint: "^9.13.0",
    globals: "^15.11.0",
    postcss: "^8.4.47",
    prettier: "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.8",
    sass: "^1.80.5",
    tailwindcss: "^3.4.14",
    terser: "^5.36.0",
    typescript: "^5.6.3",
    "unplugin-auto-import": "^0.18.3",
    "unplugin-icons": "^0.19.3",
    "unplugin-vue-components": "^0.27.4",
    "unplugin-vue-router": "^0.10.8",
    vite: "^5.4.9",
    "vite-plugin-pages": "^0.32.3",
    "vite-plugin-vue-devtools": "^7.5.3",
    "vue-tsc": "^2.1.6",
    "web-ext": "^8.3.0",
    "webext-bridge": "^6.0.1"
  },
  displayName: "BrickBuddy",
  name: "brick-buddy",
  overrides: {
    "@crxjs/vite-plugin": "$@crxjs/vite-plugin"
  },
  pnpm: {
    overrides: {},
    peerDependencyRules: {
      allowAny: [],
      allowedDeprecatedVersions: {
        "sourcemap-codec": "1.4.8"
      },
      allowedVersions: {},
      ignoreMissing: []
    }
  },
  private: true,
  repository: {
    type: "git",
    url: "https://github.com/mubaidr/vite-vue3-chrome-extension-v3"
  },
  scripts: {
    build: "npm run build:chrome && npm run build:firefox",
    "build:chrome": "vite build -c vite.chrome.config.ts",
    "build:firefox": "vite build -c vite.firefox.config.ts",
    dev: 'concurrently "npm run dev:chrome" "npm run dev:firefox"',
    "dev:chrome": "vite -c vite.chrome.config.ts",
    "dev:firefox": "vite build --mode development --watch -c vite.firefox.config.ts",
    format: "prettier --write .",
    lint: "eslint . --fix",
    "lint:manifest": "web-ext lint --pretty",
    preview: "vite preview",
    typecheck: "vue-tsc --noEmit"
  },
  type: "module",
  version: "0.0.2"
};

// manifest.config.ts
var { version, name, description, displayName } = package_default;
var [major, minor, patch, label = "0"] = version.replace(/[^\d.-]+/g, "").split(/[.-]/);
var manifest_config_default = {
  name: env.mode === "staging" ? `[INTERNAL] ${name}` : displayName || name,
  description,
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  manifest_version: 3,
  // key: '',
  action: {
    default_popup: "src/popup/index.html"
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      all_frames: true,
      js: ["src/content-script/index.ts"],
      matches: ["*://*/*"],
      run_at: "document_end"
    }
  ],
  // Full options page
  options_page: "src/options/index.html",
  // Embedded options page
  // options_ui: {
  //   page: 'src/options/index.html',
  // },
  offline_enabled: true,
  // host_permissions: [],
  permissions: ["storage", "tabs", "background"],
  web_accessible_resources: [
    {
      matches: ["*://*/*"],
      resources: ["src/content-script/index.ts"]
    },
    {
      matches: ["*://*/*"],
      resources: ["src/content-script/iframe/index.html"]
    }
  ],
  icons: {
    16: "src/assets/logo.png",
    24: "src/assets/logo.png",
    32: "src/assets/logo.png",
    128: "src/assets/logo.png"
  }
};

// manifest.chrome.config.ts
var manifest_chrome_config_default = defineManifest((_env) => ({
  ...manifest_config_default
}));

// vite.config.ts
import { dirname, relative } from "node:path";
import { fileURLToPath, URL } from "node:url";
import vue from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.10_@types+node@22.8.4_sass@1.80.5_terser@5.36.0__vue@3.5.12_typescript@5.6.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/unplugin-auto-import@0.18.3_@vueuse+core@11.1.0_vue@3.5.12_typescript@5.6.3___rollup@4.24.3/node_modules/unplugin-auto-import/dist/vite.js";
import IconsResolver from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/unplugin-icons@0.19.3_@vue+compiler-sfc@3.5.12/node_modules/unplugin-icons/dist/resolver.js";
import Icons from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/unplugin-icons@0.19.3_@vue+compiler-sfc@3.5.12/node_modules/unplugin-icons/dist/vite.js";
import Components from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/unplugin-vue-components@0.27.4_@babel+parser@7.26.1_rollup@4.24.3_vue@3.5.12_typescript@5.6.3_/node_modules/unplugin-vue-components/dist/vite.js";
import { defineConfig } from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/vite@5.4.10_@types+node@22.8.4_sass@1.80.5_terser@5.36.0/node_modules/vite/dist/node/index.js";
import Pages from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/vite-plugin-pages@0.32.3_@vue+compiler-sfc@3.5.12_vite@5.4.10_@types+node@22.8.4_sass@1.80.5__f2pu5q6apd57xw37qedsr4peee/node_modules/vite-plugin-pages/dist/index.js";
import vueDevTools from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/vite-plugin-vue-devtools@7.5.6_rollup@4.24.3_vite@5.4.10_@types+node@22.8.4_sass@1.80.5_terse_zcqkldp2suyb7ru72uttecua4q/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";

// define.config.ts
import { spawnSync } from "node:child_process";
import fs from "node:fs";
var changelog = fs.readFileSync("./CHANGELOG.md", "utf-8");
var gitCommit = spawnSync("git", ["rev-parse", "--short", "HEAD"]).stdout.toString().trim();
var jsn = (value) => JSON.stringify(value);
var defineViteConfig = {
  __VERSION__: jsn(package_default.version),
  __NAME__: jsn(package_default.name),
  __DISPLAY_NAME__: jsn(package_default.displayName),
  __CHANGELOG__: jsn(changelog),
  __GIT_COMMIT__: jsn(gitCommit),
  __GITHUB_URL__: jsn(package_default.repository.url),
  // Set the HTML title for all pages from package.json so you can use %HTML_TITLE% in your HTML files.
  "import.meta.env.HTML_TITLE": jsn(package_default.displayName)
};

// vite.config.ts
var __vite_injected_original_import_meta_url = "file:///Users/op/repos/brickbuddy/vite.config.ts";
var vite_config_default = defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "~": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      src: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@assets": fileURLToPath(new URL("src/assets", __vite_injected_original_import_meta_url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern"
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    Pages({
      dirs: [
        {
          dir: "src/pages",
          baseRoute: "common"
        },
        {
          dir: "src/setup/pages",
          baseRoute: "setup"
        },
        {
          dir: "src/popup/pages",
          baseRoute: "popup"
        },
        {
          dir: "src/options/pages",
          baseRoute: "options"
        },
        {
          dir: "src/content-script/iframe/pages",
          baseRoute: "iframe"
        }
      ]
    }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/core",
        {
          "webextension-polyfill": [["*", "browser"]]
        }
      ],
      dts: "src/types/auto-imports.d.ts",
      dirs: ["src/composables/", "src/stores/", "src/utils/"],
      eslintrc: {
        enabled: true,
        filepath: "src/types/.eslintrc-auto-import.json"
      }
    }),
    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: ["src/components"],
      // generate `components.d.ts` for ts support with Volar
      dts: "src/types/components.d.ts",
      resolvers: [
        // auto import icons
        IconsResolver()
      ]
    }),
    // https://github.com/antfu/unplugin-icons
    Icons({
      autoInstall: true,
      compiler: "vue3",
      scale: 1.5
    }),
    // rewrite assets to use relative path
    {
      name: "assets-rewrite",
      enforce: "post",
      apply: "build",
      transformIndexHtml(html, { path }) {
        const assetsPath = relative(dirname(path), "/assets").replace(
          /\\/g,
          "/"
        );
        return html.replace(/"\/assets\//g, `"${assetsPath}/`);
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        iframe: "src/content-script/iframe/index.html",
        popup: "src/popup/index.html",
        setup: "src/setup/index.html",
        options: "src/options/index.html"
      }
    }
  },
  optimizeDeps: {
    include: ["vue", "@vueuse/core", "webextension-polyfill"],
    exclude: ["vue-demi"]
  },
  assetsInclude: ["src/assets/*/**"],
  define: defineViteConfig
});

// vite.chrome.config.ts
vite_config_default.plugins?.push(
  crx({
    manifest: manifest_chrome_config_default,
    browser: "chrome",
    contentScripts: {
      injectCss: true
    }
  })
);
if (!vite_config_default.build) {
  vite_config_default.build = {};
}
vite_config_default.build.outDir = "dist/chrome";
var vite_chrome_config_default = defineConfig2({
  ...vite_config_default
});
export {
  vite_chrome_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jaHJvbWUuY29uZmlnLnRzIiwgIm1hbmlmZXN0LmNocm9tZS5jb25maWcudHMiLCAibWFuaWZlc3QuY29uZmlnLnRzIiwgInBhY2thZ2UuanNvbiIsICJ2aXRlLmNvbmZpZy50cyIsICJkZWZpbmUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L3ZpdGUuY2hyb21lLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeS92aXRlLmNocm9tZS5jb25maWcudHNcIjtpbXBvcnQgeyBjcnggfSBmcm9tICdAY3J4anMvdml0ZS1wbHVnaW4nXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuY2hyb21lLmNvbmZpZydcbmltcG9ydCBWaXRlQ29uZmlnIGZyb20gJy4vdml0ZS5jb25maWcnXG5cblZpdGVDb25maWcucGx1Z2lucz8ucHVzaChcbiAgY3J4KHtcbiAgICBtYW5pZmVzdCxcbiAgICBicm93c2VyOiAnY2hyb21lJyxcbiAgICBjb250ZW50U2NyaXB0czoge1xuICAgICAgaW5qZWN0Q3NzOiB0cnVlLFxuICAgIH0sXG4gIH0pXG4pXG5cbmlmICghVml0ZUNvbmZpZy5idWlsZCkge1xuICBWaXRlQ29uZmlnLmJ1aWxkID0ge31cbn1cblxuVml0ZUNvbmZpZy5idWlsZC5vdXREaXIgPSAnZGlzdC9jaHJvbWUnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAuLi5WaXRlQ29uZmlnLFxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L21hbmlmZXN0LmNocm9tZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvbWFuaWZlc3QuY2hyb21lLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZU1hbmlmZXN0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IE1hbmlmZXN0Q29uZmlnIGZyb20gJy4vbWFuaWZlc3QuY29uZmlnJ1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIE1hbmlmZXN0Q29uZmlnIHByb3ZpZGVzIGFsbCByZXF1aXJlZCBmaWVsZHNcbmV4cG9ydCBkZWZhdWx0IGRlZmluZU1hbmlmZXN0KChfZW52KSA9PiAoe1xuICAuLi5NYW5pZmVzdENvbmZpZyxcbn0pKVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvbWFuaWZlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L21hbmlmZXN0LmNvbmZpZy50c1wiO2ltcG9ydCB7IGVudiB9IGZyb20gJ25vZGU6cHJvY2VzcydcbmltcG9ydCB0eXBlIHsgTWFuaWZlc3RWM0V4cG9ydCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbidcbmltcG9ydCBwYWNrYWdlSnNvbiBmcm9tICcuL3BhY2thZ2UuanNvbidcblxuY29uc3QgeyB2ZXJzaW9uLCBuYW1lLCBkZXNjcmlwdGlvbiwgZGlzcGxheU5hbWUgfSA9IHBhY2thZ2VKc29uXG4vLyBDb252ZXJ0IGZyb20gU2VtdmVyIChleGFtcGxlOiAwLjEuMC1iZXRhNilcbmNvbnN0IFttYWpvciwgbWlub3IsIHBhdGNoLCBsYWJlbCA9ICcwJ10gPSB2ZXJzaW9uXG4gIC8vIGNhbiBvbmx5IGNvbnRhaW4gZGlnaXRzLCBkb3RzLCBvciBkYXNoXG4gIC5yZXBsYWNlKC9bXlxcZC4tXSsvZywgJycpXG4gIC8vIHNwbGl0IGludG8gdmVyc2lvbiBwYXJ0c1xuICAuc3BsaXQoL1suLV0vKVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6IGVudi5tb2RlID09PSAnc3RhZ2luZycgPyBgW0lOVEVSTkFMXSAke25hbWV9YCA6IGRpc3BsYXlOYW1lIHx8IG5hbWUsXG4gIGRlc2NyaXB0aW9uLFxuICAvLyB1cCB0byBmb3VyIG51bWJlcnMgc2VwYXJhdGVkIGJ5IGRvdHNcbiAgdmVyc2lvbjogYCR7bWFqb3J9LiR7bWlub3J9LiR7cGF0Y2h9LiR7bGFiZWx9YCxcbiAgLy8gc2VtdmVyIGlzIE9LIGluIFwidmVyc2lvbl9uYW1lXCJcbiAgdmVyc2lvbl9uYW1lOiB2ZXJzaW9uLFxuICBtYW5pZmVzdF92ZXJzaW9uOiAzLFxuICAvLyBrZXk6ICcnLFxuICBhY3Rpb246IHtcbiAgICBkZWZhdWx0X3BvcHVwOiAnc3JjL3BvcHVwL2luZGV4Lmh0bWwnLFxuICB9LFxuICBiYWNrZ3JvdW5kOiB7XG4gICAgc2VydmljZV93b3JrZXI6ICdzcmMvYmFja2dyb3VuZC9pbmRleC50cycsXG4gICAgdHlwZTogJ21vZHVsZScsXG4gIH0sXG4gIGNvbnRlbnRfc2NyaXB0czogW1xuICAgIHtcbiAgICAgIGFsbF9mcmFtZXM6IHRydWUsXG4gICAgICBqczogWydzcmMvY29udGVudC1zY3JpcHQvaW5kZXgudHMnXSxcbiAgICAgIG1hdGNoZXM6IFsnKjovLyovKiddLFxuICAgICAgcnVuX2F0OiAnZG9jdW1lbnRfZW5kJyxcbiAgICB9LFxuICBdLFxuICAvLyBGdWxsIG9wdGlvbnMgcGFnZVxuICBvcHRpb25zX3BhZ2U6ICdzcmMvb3B0aW9ucy9pbmRleC5odG1sJyxcbiAgLy8gRW1iZWRkZWQgb3B0aW9ucyBwYWdlXG4gIC8vIG9wdGlvbnNfdWk6IHtcbiAgLy8gICBwYWdlOiAnc3JjL29wdGlvbnMvaW5kZXguaHRtbCcsXG4gIC8vIH0sXG4gIG9mZmxpbmVfZW5hYmxlZDogdHJ1ZSxcbiAgLy8gaG9zdF9wZXJtaXNzaW9uczogW10sXG4gIHBlcm1pc3Npb25zOiBbJ3N0b3JhZ2UnLCAndGFicycsICdiYWNrZ3JvdW5kJ10sXG4gIHdlYl9hY2Nlc3NpYmxlX3Jlc291cmNlczogW1xuICAgIHtcbiAgICAgIG1hdGNoZXM6IFsnKjovLyovKiddLFxuICAgICAgcmVzb3VyY2VzOiBbJ3NyYy9jb250ZW50LXNjcmlwdC9pbmRleC50cyddLFxuICAgIH0sXG4gICAge1xuICAgICAgbWF0Y2hlczogWycqOi8vKi8qJ10sXG4gICAgICByZXNvdXJjZXM6IFsnc3JjL2NvbnRlbnQtc2NyaXB0L2lmcmFtZS9pbmRleC5odG1sJ10sXG4gICAgfSxcbiAgXSxcbiAgaWNvbnM6IHtcbiAgICAxNjogJ3NyYy9hc3NldHMvbG9nby5wbmcnLFxuICAgIDI0OiAnc3JjL2Fzc2V0cy9sb2dvLnBuZycsXG4gICAgMzI6ICdzcmMvYXNzZXRzL2xvZ28ucG5nJyxcbiAgICAxMjg6ICdzcmMvYXNzZXRzL2xvZ28ucG5nJyxcbiAgfSxcbn0gYXMgTWFuaWZlc3RWM0V4cG9ydFxuIiwgIntcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiaWRiXCI6IFwiXjguMC4wXCIsXG4gICAgXCJtYXJrZWRcIjogXCJeMTQuMS4zXCIsXG4gICAgXCJtYXRoanNcIjogXCJeMTMuMi4wXCIsXG4gICAgXCJwaW5pYVwiOiBcIl4yLjIuNFwiLFxuICAgIFwidnVlXCI6IFwiXjMuNS4xMlwiLFxuICAgIFwidnVlLXJvdXRlclwiOiBcIl40LjQuNVwiLFxuICAgIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI6IFwiXjAuMTIuMFwiXG4gIH0sXG4gIFwiZGVzY3JpcHRpb25cIjogXCJBIFZ1ZSAzICsgVml0ZSBwcm9qZWN0IGZvciBidWlsZGluZyBDaHJvbWUgZXh0ZW5zaW9uc1wiLFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAYW50ZnUvZXNsaW50LWNvbmZpZ1wiOiBcIl4zLjguMFwiLFxuICAgIFwiQGNyeGpzL3ZpdGUtcGx1Z2luXCI6IFwiXjIuMC4wLWJldGEuMjhcIixcbiAgICBcIkBpY29uaWZ5LWpzb24vbWRpXCI6IFwiXjEuMi4xXCIsXG4gICAgXCJAdGFpbHdpbmRjc3MvZm9ybXNcIjogXCJeMC41LjlcIixcbiAgICBcIkB0YWlsd2luZGNzcy90eXBvZ3JhcGh5XCI6IFwiXjAuNS4xNVwiLFxuICAgIFwiQHR5cGVzL2VzbGludFwiOiBcIl45LjYuMVwiLFxuICAgIFwiQHR5cGVzL25vZGVcIjogXCJeMjIuNy44XCIsXG4gICAgXCJAdHlwZXMvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI6IFwiXjAuMTIuMVwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiXjUuMS40XCIsXG4gICAgXCJAdnVlL2NvbXBpbGVyLXNmY1wiOiBcIl4zLjUuMTJcIixcbiAgICBcIkB2dWV1c2UvY29yZVwiOiBcIl4xMS4xLjBcIixcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIl4xMC40LjIwXCIsXG4gICAgXCJjaHJvbWUtdHlwZXNcIjogXCJeMC4xLjMxMlwiLFxuICAgIFwiY29uY3VycmVudGx5XCI6IFwiXjkuMC4xXCIsXG4gICAgXCJjcm9zcy1lbnZcIjogXCJeNy4wLjNcIixcbiAgICBcImRhaXN5dWlcIjogXCJeNC4xMi4xM1wiLFxuICAgIFwiZXNsaW50XCI6IFwiXjkuMTMuMFwiLFxuICAgIFwiZ2xvYmFsc1wiOiBcIl4xNS4xMS4wXCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC40N1wiLFxuICAgIFwicHJldHRpZXJcIjogXCJeMy4zLjNcIixcbiAgICBcInByZXR0aWVyLXBsdWdpbi10YWlsd2luZGNzc1wiOiBcIl4wLjYuOFwiLFxuICAgIFwic2Fzc1wiOiBcIl4xLjgwLjVcIixcbiAgICBcInRhaWx3aW5kY3NzXCI6IFwiXjMuNC4xNFwiLFxuICAgIFwidGVyc2VyXCI6IFwiXjUuMzYuMFwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjYuM1wiLFxuICAgIFwidW5wbHVnaW4tYXV0by1pbXBvcnRcIjogXCJeMC4xOC4zXCIsXG4gICAgXCJ1bnBsdWdpbi1pY29uc1wiOiBcIl4wLjE5LjNcIixcbiAgICBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzXCI6IFwiXjAuMjcuNFwiLFxuICAgIFwidW5wbHVnaW4tdnVlLXJvdXRlclwiOiBcIl4wLjEwLjhcIixcbiAgICBcInZpdGVcIjogXCJeNS40LjlcIixcbiAgICBcInZpdGUtcGx1Z2luLXBhZ2VzXCI6IFwiXjAuMzIuM1wiLFxuICAgIFwidml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzXCI6IFwiXjcuNS4zXCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwiXjIuMS42XCIsXG4gICAgXCJ3ZWItZXh0XCI6IFwiXjguMy4wXCIsXG4gICAgXCJ3ZWJleHQtYnJpZGdlXCI6IFwiXjYuMC4xXCJcbiAgfSxcbiAgXCJkaXNwbGF5TmFtZVwiOiBcIkJyaWNrQnVkZHlcIixcbiAgXCJuYW1lXCI6IFwiYnJpY2stYnVkZHlcIixcbiAgXCJvdmVycmlkZXNcIjoge1xuICAgIFwiQGNyeGpzL3ZpdGUtcGx1Z2luXCI6IFwiJEBjcnhqcy92aXRlLXBsdWdpblwiXG4gIH0sXG4gIFwicG5wbVwiOiB7XG4gICAgXCJvdmVycmlkZXNcIjoge30sXG4gICAgXCJwZWVyRGVwZW5kZW5jeVJ1bGVzXCI6IHtcbiAgICAgIFwiYWxsb3dBbnlcIjogW10sXG4gICAgICBcImFsbG93ZWREZXByZWNhdGVkVmVyc2lvbnNcIjoge1xuICAgICAgICBcInNvdXJjZW1hcC1jb2RlY1wiOiBcIjEuNC44XCJcbiAgICAgIH0sXG4gICAgICBcImFsbG93ZWRWZXJzaW9uc1wiOiB7fSxcbiAgICAgIFwiaWdub3JlTWlzc2luZ1wiOiBbXVxuICAgIH1cbiAgfSxcbiAgXCJwcml2YXRlXCI6IHRydWUsXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vbXViYWlkci92aXRlLXZ1ZTMtY2hyb21lLWV4dGVuc2lvbi12M1wiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJidWlsZFwiOiBcIm5wbSBydW4gYnVpbGQ6Y2hyb21lICYmIG5wbSBydW4gYnVpbGQ6ZmlyZWZveFwiLFxuICAgIFwiYnVpbGQ6Y2hyb21lXCI6IFwidml0ZSBidWlsZCAtYyB2aXRlLmNocm9tZS5jb25maWcudHNcIixcbiAgICBcImJ1aWxkOmZpcmVmb3hcIjogXCJ2aXRlIGJ1aWxkIC1jIHZpdGUuZmlyZWZveC5jb25maWcudHNcIixcbiAgICBcImRldlwiOiBcImNvbmN1cnJlbnRseSBcXFwibnBtIHJ1biBkZXY6Y2hyb21lXFxcIiBcXFwibnBtIHJ1biBkZXY6ZmlyZWZveFxcXCJcIixcbiAgICBcImRldjpjaHJvbWVcIjogXCJ2aXRlIC1jIHZpdGUuY2hyb21lLmNvbmZpZy50c1wiLFxuICAgIFwiZGV2OmZpcmVmb3hcIjogXCJ2aXRlIGJ1aWxkIC0tbW9kZSBkZXZlbG9wbWVudCAtLXdhdGNoIC1jIHZpdGUuZmlyZWZveC5jb25maWcudHNcIixcbiAgICBcImZvcm1hdFwiOiBcInByZXR0aWVyIC0td3JpdGUgLlwiLFxuICAgIFwibGludFwiOiBcImVzbGludCAuIC0tZml4XCIsXG4gICAgXCJsaW50Om1hbmlmZXN0XCI6IFwid2ViLWV4dCBsaW50IC0tcHJldHR5XCIsXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXG4gICAgXCJ0eXBlY2hlY2tcIjogXCJ2dWUtdHNjIC0tbm9FbWl0XCJcbiAgfSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMC4yXCJcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGlybmFtZSwgcmVsYXRpdmUgfSBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gJ3VucGx1Z2luLWljb25zL3Jlc29sdmVyJ1xuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBQYWdlcyBmcm9tICd2aXRlLXBsdWdpbi1wYWdlcydcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5pbXBvcnQgeyBkZWZpbmVWaXRlQ29uZmlnIGFzIGRlZmluZSB9IGZyb20gJy4vZGVmaW5lLmNvbmZpZydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBobXI6IHtcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICd+JzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgc3JjOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGFzc2V0cyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnc3JjL2Fzc2V0cycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIHNjc3M6IHtcbiAgICAgICAgYXBpOiAnbW9kZXJuJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSgpLFxuICAgIHZ1ZURldlRvb2xzKCksXG4gICAgUGFnZXMoe1xuICAgICAgZGlyczogW1xuICAgICAgICB7XG4gICAgICAgICAgZGlyOiAnc3JjL3BhZ2VzJyxcbiAgICAgICAgICBiYXNlUm91dGU6ICdjb21tb24nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZGlyOiAnc3JjL3NldHVwL3BhZ2VzJyxcbiAgICAgICAgICBiYXNlUm91dGU6ICdzZXR1cCcsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBkaXI6ICdzcmMvcG9wdXAvcGFnZXMnLFxuICAgICAgICAgIGJhc2VSb3V0ZTogJ3BvcHVwJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGRpcjogJ3NyYy9vcHRpb25zL3BhZ2VzJyxcbiAgICAgICAgICBiYXNlUm91dGU6ICdvcHRpb25zJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGRpcjogJ3NyYy9jb250ZW50LXNjcmlwdC9pZnJhbWUvcGFnZXMnLFxuICAgICAgICAgIGJhc2VSb3V0ZTogJ2lmcmFtZScsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICBpbXBvcnRzOiBbXG4gICAgICAgICd2dWUnLFxuICAgICAgICAndnVlLXJvdXRlcicsXG4gICAgICAgICdAdnVldXNlL2NvcmUnLFxuICAgICAgICB7XG4gICAgICAgICAgJ3dlYmV4dGVuc2lvbi1wb2x5ZmlsbCc6IFtbJyonLCAnYnJvd3NlciddXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBkdHM6ICdzcmMvdHlwZXMvYXV0by1pbXBvcnRzLmQudHMnLFxuICAgICAgZGlyczogWydzcmMvY29tcG9zYWJsZXMvJywgJ3NyYy9zdG9yZXMvJywgJ3NyYy91dGlscy8nXSxcbiAgICAgIGVzbGludHJjOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIGZpbGVwYXRoOiAnc3JjL3R5cGVzLy5lc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uJyxcbiAgICAgIH0sXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGRpcnM6IFsnc3JjL2NvbXBvbmVudHMnXSxcbiAgICAgIC8vIGdlbmVyYXRlIGBjb21wb25lbnRzLmQudHNgIGZvciB0cyBzdXBwb3J0IHdpdGggVm9sYXJcbiAgICAgIGR0czogJ3NyYy90eXBlcy9jb21wb25lbnRzLmQudHMnLFxuICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgIC8vIGF1dG8gaW1wb3J0IGljb25zXG4gICAgICAgIEljb25zUmVzb2x2ZXIoKSxcbiAgICAgIF0sXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4taWNvbnNcbiAgICBJY29ucyh7XG4gICAgICBhdXRvSW5zdGFsbDogdHJ1ZSxcbiAgICAgIGNvbXBpbGVyOiAndnVlMycsXG4gICAgICBzY2FsZTogMS41LFxuICAgIH0pLFxuICAgIC8vIHJld3JpdGUgYXNzZXRzIHRvIHVzZSByZWxhdGl2ZSBwYXRoXG4gICAge1xuICAgICAgbmFtZTogJ2Fzc2V0cy1yZXdyaXRlJyxcbiAgICAgIGVuZm9yY2U6ICdwb3N0JyxcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwsIHsgcGF0aCB9KSB7XG4gICAgICAgIGNvbnN0IGFzc2V0c1BhdGggPSByZWxhdGl2ZShkaXJuYW1lKHBhdGgpLCAnL2Fzc2V0cycpLnJlcGxhY2UoXG4gICAgICAgICAgL1xcXFwvZyxcbiAgICAgICAgICAnLydcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKC9cIlxcL2Fzc2V0c1xcLy9nLCBgXCIke2Fzc2V0c1BhdGh9L2ApXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgaWZyYW1lOiAnc3JjL2NvbnRlbnQtc2NyaXB0L2lmcmFtZS9pbmRleC5odG1sJyxcbiAgICAgICAgcG9wdXA6ICdzcmMvcG9wdXAvaW5kZXguaHRtbCcsXG4gICAgICAgIHNldHVwOiAnc3JjL3NldHVwL2luZGV4Lmh0bWwnLFxuICAgICAgICBvcHRpb25zOiAnc3JjL29wdGlvbnMvaW5kZXguaHRtbCcsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsndnVlJywgJ0B2dWV1c2UvY29yZScsICd3ZWJleHRlbnNpb24tcG9seWZpbGwnXSxcbiAgICBleGNsdWRlOiBbJ3Z1ZS1kZW1pJ10sXG4gIH0sXG4gIGFzc2V0c0luY2x1ZGU6IFsnc3JjL2Fzc2V0cy8qLyoqJ10sXG4gIGRlZmluZSxcbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeS9kZWZpbmUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L2RlZmluZS5jb25maWcudHNcIjtpbXBvcnQgeyBzcGF3blN5bmMgfSBmcm9tICdub2RlOmNoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcydcbmltcG9ydCBwYWNrYWdlSnNvbiBmcm9tICcuL3BhY2thZ2UuanNvbidcblxuLy8gUmVhZCBDSEFOR0VMT0cubWQgZmlsZSBpbnRvIGEgc3RyaW5nLlxuY29uc3QgY2hhbmdlbG9nID0gZnMucmVhZEZpbGVTeW5jKCcuL0NIQU5HRUxPRy5tZCcsICd1dGYtOCcpXG5cbi8vIEdldCB0aGUgY3VycmVudCBnaXQgY29tbWl0IGhhc2guXG5jb25zdCBnaXRDb21taXQgPSBzcGF3blN5bmMoJ2dpdCcsIFsncmV2LXBhcnNlJywgJy0tc2hvcnQnLCAnSEVBRCddKVxuICAuc3Rkb3V0LnRvU3RyaW5nKClcbiAgLnRyaW0oKVxuXG5jb25zdCBqc24gPSAodmFsdWU6IHN0cmluZykgPT4gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG5cbi8vIERvbid0IGZvcmdldCB0byBhZGQgeW91ciBhZGRlZCB2YXJpYWJsZXMgdG8gdml0ZS1lbnYuZC50cyBhbHNvIVxuXG4vLyBUaGVzZSB2YXJpYWJsZXMgYXJlIGF2YWlsYWJsZSBpbiB5b3VyIFZ1ZSBjb21wb25lbnRzIGFuZCB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZWlyIHZhbHVlcyBhdCBidWlsZCB0aW1lLlxuLy8gVGhlc2Ugd2lsbCBiZSBjb21waWxlZCBpbnRvIHlvdXIgYXBwLiBEb24ndCBzdG9yZSBzZWNyZXRzIGhlcmUhXG5cbmV4cG9ydCBjb25zdCBkZWZpbmVWaXRlQ29uZmlnID0ge1xuICBfX1ZFUlNJT05fXzoganNuKHBhY2thZ2VKc29uLnZlcnNpb24pLFxuICBfX05BTUVfXzoganNuKHBhY2thZ2VKc29uLm5hbWUpLFxuICBfX0RJU1BMQVlfTkFNRV9fOiBqc24ocGFja2FnZUpzb24uZGlzcGxheU5hbWUpLFxuICBfX0NIQU5HRUxPR19fOiBqc24oY2hhbmdlbG9nKSxcbiAgX19HSVRfQ09NTUlUX186IGpzbihnaXRDb21taXQpLFxuICBfX0dJVEhVQl9VUkxfXzoganNuKHBhY2thZ2VKc29uLnJlcG9zaXRvcnkudXJsKSxcblxuICAvLyBTZXQgdGhlIEhUTUwgdGl0bGUgZm9yIGFsbCBwYWdlcyBmcm9tIHBhY2thZ2UuanNvbiBzbyB5b3UgY2FuIHVzZSAlSFRNTF9USVRMRSUgaW4geW91ciBIVE1MIGZpbGVzLlxuICAnaW1wb3J0Lm1ldGEuZW52LkhUTUxfVElUTEUnOiBqc24ocGFja2FnZUpzb24uZGlzcGxheU5hbWUpLFxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4USxTQUFTLFdBQVc7QUFDbFMsU0FBUyxnQkFBQUEscUJBQW9COzs7QUNEeVAsU0FBUyxzQkFBc0I7OztBQ0E3QyxTQUFTLFdBQVc7OztBQ0E1UjtBQUFBLEVBQ0UsY0FBZ0I7QUFBQSxJQUNkLEtBQU87QUFBQSxJQUNQLFFBQVU7QUFBQSxJQUNWLFFBQVU7QUFBQSxJQUNWLE9BQVM7QUFBQSxJQUNULEtBQU87QUFBQSxJQUNQLGNBQWM7QUFBQSxJQUNkLHlCQUF5QjtBQUFBLEVBQzNCO0FBQUEsRUFDQSxhQUFlO0FBQUEsRUFDZixpQkFB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QVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsVUFDRSx5QkFBeUIsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDO0FBQUEsUUFDNUM7QUFBQSxNQUNGO0FBQUEsTUFDQSxLQUFLO0FBQUEsTUFDTCxNQUFNLENBQUMsb0JBQW9CLGVBQWUsWUFBWTtBQUFBLE1BQ3RELFVBQVU7QUFBQSxRQUNSLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUdELFdBQVc7QUFBQSxNQUNULE1BQU0sQ0FBQyxnQkFBZ0I7QUFBQTtBQUFBLE1BRXZCLEtBQUs7QUFBQSxNQUNMLFdBQVc7QUFBQTtBQUFBLFFBRVQsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUdELE1BQU07QUFBQSxNQUNKLGFBQWE7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLE9BQU87QUFBQSxJQUNULENBQUM7QUFBQTtBQUFBLElBRUQ7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULE9BQU87QUFBQSxNQUNQLG1CQUFtQixNQUFNLEVBQUUsS0FBSyxHQUFHO0FBQ2pDLGNBQU0sYUFBYSxTQUFTLFFBQVEsSUFBSSxHQUFHLFNBQVMsRUFBRTtBQUFBLFVBQ3BEO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFDQSxlQUFPLEtBQUssUUFBUSxnQkFBZ0IsSUFBSSxVQUFVLEdBQUc7QUFBQSxNQUN2RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsUUFDUixPQUFPO0FBQUEsUUFDUCxPQUFPO0FBQUEsUUFDUCxTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsT0FBTyxnQkFBZ0IsdUJBQXVCO0FBQUEsSUFDeEQsU0FBUyxDQUFDLFVBQVU7QUFBQSxFQUN0QjtBQUFBLEVBQ0EsZUFBZSxDQUFDLGlCQUFpQjtBQUFBLEVBQ2pDO0FBQ0YsQ0FBQzs7O0FKM0hELG9CQUFXLFNBQVM7QUFBQSxFQUNsQixJQUFJO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLElBQ1QsZ0JBQWdCO0FBQUEsTUFDZCxXQUFXO0FBQUEsSUFDYjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsSUFBSSxDQUFDLG9CQUFXLE9BQU87QUFDckIsc0JBQVcsUUFBUSxDQUFDO0FBQ3RCO0FBRUEsb0JBQVcsTUFBTSxTQUFTO0FBRzFCLElBQU8sNkJBQVFDLGNBQWE7QUFBQSxFQUMxQixHQUFHO0FBQ0wsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyJdCn0K
