// vite.firefox.config.ts
import { crx } from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/@crxjs+vite-plugin@2.0.0-beta.28/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import { defineConfig as defineConfig2 } from "file:///Users/op/repos/brickbuddy/node_modules/.pnpm/vite@5.4.10_@types+node@22.8.4_sass@1.80.5_terser@5.36.0/node_modules/vite/dist/node/index.js";

// manifest.firefox.config.ts
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

// manifest.firefox.config.ts
var manifest_firefox_config_default = defineManifest((_env) => ({
  ...manifest_config_default,
  browser_specific_settings: {
    gecko: {
      id: "{2e4f5834-d742-411d-bfe1-49fc4433aaa1}"
      // ID from manifest.config.ts
    }
  },
  background: {
    scripts: ["src/background/index.ts"],
    type: "module",
    persistent: false
  },
  // @ts-expect-error
  permissions: manifest_config_default.permissions.filter(
    (permission) => permission !== "background"
  )
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

// vite.firefox.config.ts
vite_config_default.plugins?.push(
  crx({
    manifest: manifest_firefox_config_default,
    browser: "firefox",
    contentScripts: {
      injectCss: true
    }
  })
);
if (!vite_config_default.build) {
  vite_config_default.build = {};
}
vite_config_default.build.outDir = "dist/firefox";
var vite_firefox_config_default = defineConfig2({
  ...vite_config_default
});
export {
  vite_firefox_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5maXJlZm94LmNvbmZpZy50cyIsICJtYW5pZmVzdC5maXJlZm94LmNvbmZpZy50cyIsICJtYW5pZmVzdC5jb25maWcudHMiLCAicGFja2FnZS5qc29uIiwgInZpdGUuY29uZmlnLnRzIiwgImRlZmluZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvdml0ZS5maXJlZm94LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeS92aXRlLmZpcmVmb3guY29uZmlnLnRzXCI7aW1wb3J0IHsgY3J4IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBtYW5pZmVzdCBmcm9tICcuL21hbmlmZXN0LmZpcmVmb3guY29uZmlnJ1xuaW1wb3J0IFZpdGVDb25maWcgZnJvbSAnLi92aXRlLmNvbmZpZydcblxuVml0ZUNvbmZpZy5wbHVnaW5zPy5wdXNoKFxuICBjcngoe1xuICAgIG1hbmlmZXN0LFxuICAgIGJyb3dzZXI6ICdmaXJlZm94JyxcbiAgICBjb250ZW50U2NyaXB0czoge1xuICAgICAgaW5qZWN0Q3NzOiB0cnVlLFxuICAgIH0sXG4gIH0pXG4pXG5cbmlmICghVml0ZUNvbmZpZy5idWlsZCkge1xuICBWaXRlQ29uZmlnLmJ1aWxkID0ge31cbn1cblxuVml0ZUNvbmZpZy5idWlsZC5vdXREaXIgPSAnZGlzdC9maXJlZm94J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgLi4uVml0ZUNvbmZpZyxcbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeS9tYW5pZmVzdC5maXJlZm94LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeS9tYW5pZmVzdC5maXJlZm94LmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZU1hbmlmZXN0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IE1hbmlmZXN0Q29uZmlnIGZyb20gJy4vbWFuaWZlc3QuY29uZmlnJ1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIE1hbmlmZXN0Q29uZmlnIHByb3ZpZGVzIGFsbCByZXF1aXJlZCBmaWVsZHNcbmV4cG9ydCBkZWZhdWx0IGRlZmluZU1hbmlmZXN0KChfZW52KSA9PiAoe1xuICAuLi5NYW5pZmVzdENvbmZpZyxcbiAgYnJvd3Nlcl9zcGVjaWZpY19zZXR0aW5nczoge1xuICAgIGdlY2tvOiB7XG4gICAgICBpZDogJ3syZTRmNTgzNC1kNzQyLTQxMWQtYmZlMS00OWZjNDQzM2FhYTF9JywgLy8gSUQgZnJvbSBtYW5pZmVzdC5jb25maWcudHNcbiAgICB9LFxuICB9LFxuICBiYWNrZ3JvdW5kOiB7XG4gICAgc2NyaXB0czogWydzcmMvYmFja2dyb3VuZC9pbmRleC50cyddLFxuICAgIHR5cGU6ICdtb2R1bGUnLFxuICAgIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICB9LFxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIHBlcm1pc3Npb25zOiBNYW5pZmVzdENvbmZpZy5wZXJtaXNzaW9ucy5maWx0ZXIoXG4gICAgKHBlcm1pc3Npb24pID0+IHBlcm1pc3Npb24gIT09ICdiYWNrZ3JvdW5kJ1xuICApLFxufSkpXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeS9tYW5pZmVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvbWFuaWZlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZW52IH0gZnJvbSAnbm9kZTpwcm9jZXNzJ1xuaW1wb3J0IHR5cGUgeyBNYW5pZmVzdFYzRXhwb3J0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IHBhY2thZ2VKc29uIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG5jb25zdCB7IHZlcnNpb24sIG5hbWUsIGRlc2NyaXB0aW9uLCBkaXNwbGF5TmFtZSB9ID0gcGFja2FnZUpzb25cbi8vIENvbnZlcnQgZnJvbSBTZW12ZXIgKGV4YW1wbGU6IDAuMS4wLWJldGE2KVxuY29uc3QgW21ham9yLCBtaW5vciwgcGF0Y2gsIGxhYmVsID0gJzAnXSA9IHZlcnNpb25cbiAgLy8gY2FuIG9ubHkgY29udGFpbiBkaWdpdHMsIGRvdHMsIG9yIGRhc2hcbiAgLnJlcGxhY2UoL1teXFxkLi1dKy9nLCAnJylcbiAgLy8gc3BsaXQgaW50byB2ZXJzaW9uIHBhcnRzXG4gIC5zcGxpdCgvWy4tXS8pXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogZW52Lm1vZGUgPT09ICdzdGFnaW5nJyA/IGBbSU5URVJOQUxdICR7bmFtZX1gIDogZGlzcGxheU5hbWUgfHwgbmFtZSxcbiAgZGVzY3JpcHRpb24sXG4gIC8vIHVwIHRvIGZvdXIgbnVtYmVycyBzZXBhcmF0ZWQgYnkgZG90c1xuICB2ZXJzaW9uOiBgJHttYWpvcn0uJHttaW5vcn0uJHtwYXRjaH0uJHtsYWJlbH1gLFxuICAvLyBzZW12ZXIgaXMgT0sgaW4gXCJ2ZXJzaW9uX25hbWVcIlxuICB2ZXJzaW9uX25hbWU6IHZlcnNpb24sXG4gIG1hbmlmZXN0X3ZlcnNpb246IDMsXG4gIC8vIGtleTogJycsXG4gIGFjdGlvbjoge1xuICAgIGRlZmF1bHRfcG9wdXA6ICdzcmMvcG9wdXAvaW5kZXguaHRtbCcsXG4gIH0sXG4gIGJhY2tncm91bmQ6IHtcbiAgICBzZXJ2aWNlX3dvcmtlcjogJ3NyYy9iYWNrZ3JvdW5kL2luZGV4LnRzJyxcbiAgICB0eXBlOiAnbW9kdWxlJyxcbiAgfSxcbiAgY29udGVudF9zY3JpcHRzOiBbXG4gICAge1xuICAgICAgYWxsX2ZyYW1lczogdHJ1ZSxcbiAgICAgIGpzOiBbJ3NyYy9jb250ZW50LXNjcmlwdC9pbmRleC50cyddLFxuICAgICAgbWF0Y2hlczogWycqOi8vKi8qJ10sXG4gICAgICBydW5fYXQ6ICdkb2N1bWVudF9lbmQnLFxuICAgIH0sXG4gIF0sXG4gIC8vIEZ1bGwgb3B0aW9ucyBwYWdlXG4gIG9wdGlvbnNfcGFnZTogJ3NyYy9vcHRpb25zL2luZGV4Lmh0bWwnLFxuICAvLyBFbWJlZGRlZCBvcHRpb25zIHBhZ2VcbiAgLy8gb3B0aW9uc191aToge1xuICAvLyAgIHBhZ2U6ICdzcmMvb3B0aW9ucy9pbmRleC5odG1sJyxcbiAgLy8gfSxcbiAgb2ZmbGluZV9lbmFibGVkOiB0cnVlLFxuICAvLyBob3N0X3Blcm1pc3Npb25zOiBbXSxcbiAgcGVybWlzc2lvbnM6IFsnc3RvcmFnZScsICd0YWJzJywgJ2JhY2tncm91bmQnXSxcbiAgd2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzOiBbXG4gICAge1xuICAgICAgbWF0Y2hlczogWycqOi8vKi8qJ10sXG4gICAgICByZXNvdXJjZXM6IFsnc3JjL2NvbnRlbnQtc2NyaXB0L2luZGV4LnRzJ10sXG4gICAgfSxcbiAgICB7XG4gICAgICBtYXRjaGVzOiBbJyo6Ly8qLyonXSxcbiAgICAgIHJlc291cmNlczogWydzcmMvY29udGVudC1zY3JpcHQvaWZyYW1lL2luZGV4Lmh0bWwnXSxcbiAgICB9LFxuICBdLFxuICBpY29uczoge1xuICAgIDE2OiAnc3JjL2Fzc2V0cy9sb2dvLnBuZycsXG4gICAgMjQ6ICdzcmMvYXNzZXRzL2xvZ28ucG5nJyxcbiAgICAzMjogJ3NyYy9hc3NldHMvbG9nby5wbmcnLFxuICAgIDEyODogJ3NyYy9hc3NldHMvbG9nby5wbmcnLFxuICB9LFxufSBhcyBNYW5pZmVzdFYzRXhwb3J0XG4iLCAie1xuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJpZGJcIjogXCJeOC4wLjBcIixcbiAgICBcIm1hcmtlZFwiOiBcIl4xNC4xLjNcIixcbiAgICBcIm1hdGhqc1wiOiBcIl4xMy4yLjBcIixcbiAgICBcInBpbmlhXCI6IFwiXjIuMi40XCIsXG4gICAgXCJ2dWVcIjogXCJeMy41LjEyXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuNC41XCIsXG4gICAgXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjogXCJeMC4xMi4wXCJcbiAgfSxcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkEgVnVlIDMgKyBWaXRlIHByb2plY3QgZm9yIGJ1aWxkaW5nIENocm9tZSBleHRlbnNpb25zXCIsXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBhbnRmdS9lc2xpbnQtY29uZmlnXCI6IFwiXjMuOC4wXCIsXG4gICAgXCJAY3J4anMvdml0ZS1wbHVnaW5cIjogXCJeMi4wLjAtYmV0YS4yOFwiLFxuICAgIFwiQGljb25pZnktanNvbi9tZGlcIjogXCJeMS4yLjFcIixcbiAgICBcIkB0YWlsd2luZGNzcy9mb3Jtc1wiOiBcIl4wLjUuOVwiLFxuICAgIFwiQHRhaWx3aW5kY3NzL3R5cG9ncmFwaHlcIjogXCJeMC41LjE1XCIsXG4gICAgXCJAdHlwZXMvZXNsaW50XCI6IFwiXjkuNi4xXCIsXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4yMi43LjhcIixcbiAgICBcIkB0eXBlcy93ZWJleHRlbnNpb24tcG9seWZpbGxcIjogXCJeMC4xMi4xXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNS4xLjRcIixcbiAgICBcIkB2dWUvY29tcGlsZXItc2ZjXCI6IFwiXjMuNS4xMlwiLFxuICAgIFwiQHZ1ZXVzZS9jb3JlXCI6IFwiXjExLjEuMFwiLFxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMjBcIixcbiAgICBcImNocm9tZS10eXBlc1wiOiBcIl4wLjEuMzEyXCIsXG4gICAgXCJjb25jdXJyZW50bHlcIjogXCJeOS4wLjFcIixcbiAgICBcImNyb3NzLWVudlwiOiBcIl43LjAuM1wiLFxuICAgIFwiZGFpc3l1aVwiOiBcIl40LjEyLjEzXCIsXG4gICAgXCJlc2xpbnRcIjogXCJeOS4xMy4wXCIsXG4gICAgXCJnbG9iYWxzXCI6IFwiXjE1LjExLjBcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjQ3XCIsXG4gICAgXCJwcmV0dGllclwiOiBcIl4zLjMuM1wiLFxuICAgIFwicHJldHRpZXItcGx1Z2luLXRhaWx3aW5kY3NzXCI6IFwiXjAuNi44XCIsXG4gICAgXCJzYXNzXCI6IFwiXjEuODAuNVwiLFxuICAgIFwidGFpbHdpbmRjc3NcIjogXCJeMy40LjE0XCIsXG4gICAgXCJ0ZXJzZXJcIjogXCJeNS4zNi4wXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuNi4zXCIsXG4gICAgXCJ1bnBsdWdpbi1hdXRvLWltcG9ydFwiOiBcIl4wLjE4LjNcIixcbiAgICBcInVucGx1Z2luLWljb25zXCI6IFwiXjAuMTkuM1wiLFxuICAgIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcIjogXCJeMC4yNy40XCIsXG4gICAgXCJ1bnBsdWdpbi12dWUtcm91dGVyXCI6IFwiXjAuMTAuOFwiLFxuICAgIFwidml0ZVwiOiBcIl41LjQuOVwiLFxuICAgIFwidml0ZS1wbHVnaW4tcGFnZXNcIjogXCJeMC4zMi4zXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHNcIjogXCJeNy41LjNcIixcbiAgICBcInZ1ZS10c2NcIjogXCJeMi4xLjZcIixcbiAgICBcIndlYi1leHRcIjogXCJeOC4zLjBcIixcbiAgICBcIndlYmV4dC1icmlkZ2VcIjogXCJeNi4wLjFcIlxuICB9LFxuICBcImRpc3BsYXlOYW1lXCI6IFwiQnJpY2tCdWRkeVwiLFxuICBcIm5hbWVcIjogXCJicmljay1idWRkeVwiLFxuICBcIm92ZXJyaWRlc1wiOiB7XG4gICAgXCJAY3J4anMvdml0ZS1wbHVnaW5cIjogXCIkQGNyeGpzL3ZpdGUtcGx1Z2luXCJcbiAgfSxcbiAgXCJwbnBtXCI6IHtcbiAgICBcIm92ZXJyaWRlc1wiOiB7fSxcbiAgICBcInBlZXJEZXBlbmRlbmN5UnVsZXNcIjoge1xuICAgICAgXCJhbGxvd0FueVwiOiBbXSxcbiAgICAgIFwiYWxsb3dlZERlcHJlY2F0ZWRWZXJzaW9uc1wiOiB7XG4gICAgICAgIFwic291cmNlbWFwLWNvZGVjXCI6IFwiMS40LjhcIlxuICAgICAgfSxcbiAgICAgIFwiYWxsb3dlZFZlcnNpb25zXCI6IHt9LFxuICAgICAgXCJpZ25vcmVNaXNzaW5nXCI6IFtdXG4gICAgfVxuICB9LFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9tdWJhaWRyL3ZpdGUtdnVlMy1jaHJvbWUtZXh0ZW5zaW9uLXYzXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImJ1aWxkXCI6IFwibnBtIHJ1biBidWlsZDpjaHJvbWUgJiYgbnBtIHJ1biBidWlsZDpmaXJlZm94XCIsXG4gICAgXCJidWlsZDpjaHJvbWVcIjogXCJ2aXRlIGJ1aWxkIC1jIHZpdGUuY2hyb21lLmNvbmZpZy50c1wiLFxuICAgIFwiYnVpbGQ6ZmlyZWZveFwiOiBcInZpdGUgYnVpbGQgLWMgdml0ZS5maXJlZm94LmNvbmZpZy50c1wiLFxuICAgIFwiZGV2XCI6IFwiY29uY3VycmVudGx5IFxcXCJucG0gcnVuIGRldjpjaHJvbWVcXFwiIFxcXCJucG0gcnVuIGRldjpmaXJlZm94XFxcIlwiLFxuICAgIFwiZGV2OmNocm9tZVwiOiBcInZpdGUgLWMgdml0ZS5jaHJvbWUuY29uZmlnLnRzXCIsXG4gICAgXCJkZXY6ZmlyZWZveFwiOiBcInZpdGUgYnVpbGQgLS1tb2RlIGRldmVsb3BtZW50IC0td2F0Y2ggLWMgdml0ZS5maXJlZm94LmNvbmZpZy50c1wiLFxuICAgIFwiZm9ybWF0XCI6IFwicHJldHRpZXIgLS13cml0ZSAuXCIsXG4gICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1maXhcIixcbiAgICBcImxpbnQ6bWFuaWZlc3RcIjogXCJ3ZWItZXh0IGxpbnQgLS1wcmV0dHlcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInR5cGVjaGVja1wiOiBcInZ1ZS10c2MgLS1ub0VtaXRcIlxuICB9LFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjJcIlxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvb3AvcmVwb3MvYnJpY2tidWRkeVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkaXJuYW1lLCByZWxhdGl2ZSB9IGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInXG5pbXBvcnQgSWNvbnMgZnJvbSAndW5wbHVnaW4taWNvbnMvdml0ZSdcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IFBhZ2VzIGZyb20gJ3ZpdGUtcGx1Z2luLXBhZ2VzJ1xuaW1wb3J0IHZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scydcbmltcG9ydCB7IGRlZmluZVZpdGVDb25maWcgYXMgZGVmaW5lIH0gZnJvbSAnLi9kZWZpbmUuY29uZmlnJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGhtcjoge1xuICAgICAgcG9ydDogNTE3MyxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ34nOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICBzcmM6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAYXNzZXRzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCdzcmMvYXNzZXRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhcGk6ICdtb2Rlcm4nLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdnVlRGV2VG9vbHMoKSxcbiAgICBQYWdlcyh7XG4gICAgICBkaXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBkaXI6ICdzcmMvcGFnZXMnLFxuICAgICAgICAgIGJhc2VSb3V0ZTogJ2NvbW1vbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBkaXI6ICdzcmMvc2V0dXAvcGFnZXMnLFxuICAgICAgICAgIGJhc2VSb3V0ZTogJ3NldHVwJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGRpcjogJ3NyYy9wb3B1cC9wYWdlcycsXG4gICAgICAgICAgYmFzZVJvdXRlOiAncG9wdXAnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZGlyOiAnc3JjL29wdGlvbnMvcGFnZXMnLFxuICAgICAgICAgIGJhc2VSb3V0ZTogJ29wdGlvbnMnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgZGlyOiAnc3JjL2NvbnRlbnQtc2NyaXB0L2lmcmFtZS9wYWdlcycsXG4gICAgICAgICAgYmFzZVJvdXRlOiAnaWZyYW1lJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSksXG5cbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgJ3Z1ZScsXG4gICAgICAgICd2dWUtcm91dGVyJyxcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAgIHtcbiAgICAgICAgICAnd2ViZXh0ZW5zaW9uLXBvbHlmaWxsJzogW1snKicsICdicm93c2VyJ11dLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGR0czogJ3NyYy90eXBlcy9hdXRvLWltcG9ydHMuZC50cycsXG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb3NhYmxlcy8nLCAnc3JjL3N0b3Jlcy8nLCAnc3JjL3V0aWxzLyddLFxuICAgICAgZXNsaW50cmM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgZmlsZXBhdGg6ICdzcmMvdHlwZXMvLmVzbGludHJjLWF1dG8taW1wb3J0Lmpzb24nLFxuICAgICAgfSxcbiAgICB9KSxcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi12dWUtY29tcG9uZW50c1xuICAgIENvbXBvbmVudHMoe1xuICAgICAgZGlyczogWydzcmMvY29tcG9uZW50cyddLFxuICAgICAgLy8gZ2VuZXJhdGUgYGNvbXBvbmVudHMuZC50c2AgZm9yIHRzIHN1cHBvcnQgd2l0aCBWb2xhclxuICAgICAgZHRzOiAnc3JjL3R5cGVzL2NvbXBvbmVudHMuZC50cycsXG4gICAgICByZXNvbHZlcnM6IFtcbiAgICAgICAgLy8gYXV0byBpbXBvcnQgaWNvbnNcbiAgICAgICAgSWNvbnNSZXNvbHZlcigpLFxuICAgICAgXSxcbiAgICB9KSxcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1pY29uc1xuICAgIEljb25zKHtcbiAgICAgIGF1dG9JbnN0YWxsOiB0cnVlLFxuICAgICAgY29tcGlsZXI6ICd2dWUzJyxcbiAgICAgIHNjYWxlOiAxLjUsXG4gICAgfSksXG4gICAgLy8gcmV3cml0ZSBhc3NldHMgdG8gdXNlIHJlbGF0aXZlIHBhdGhcbiAgICB7XG4gICAgICBuYW1lOiAnYXNzZXRzLXJld3JpdGUnLFxuICAgICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgICAgYXBwbHk6ICdidWlsZCcsXG4gICAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCwgeyBwYXRoIH0pIHtcbiAgICAgICAgY29uc3QgYXNzZXRzUGF0aCA9IHJlbGF0aXZlKGRpcm5hbWUocGF0aCksICcvYXNzZXRzJykucmVwbGFjZShcbiAgICAgICAgICAvXFxcXC9nLFxuICAgICAgICAgICcvJ1xuICAgICAgICApXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoL1wiXFwvYXNzZXRzXFwvL2csIGBcIiR7YXNzZXRzUGF0aH0vYClcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBpZnJhbWU6ICdzcmMvY29udGVudC1zY3JpcHQvaWZyYW1lL2luZGV4Lmh0bWwnLFxuICAgICAgICBwb3B1cDogJ3NyYy9wb3B1cC9pbmRleC5odG1sJyxcbiAgICAgICAgc2V0dXA6ICdzcmMvc2V0dXAvaW5kZXguaHRtbCcsXG4gICAgICAgIG9wdGlvbnM6ICdzcmMvb3B0aW9ucy9pbmRleC5odG1sJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWyd2dWUnLCAnQHZ1ZXVzZS9jb3JlJywgJ3dlYmV4dGVuc2lvbi1wb2x5ZmlsbCddLFxuICAgIGV4Y2x1ZGU6IFsndnVlLWRlbWknXSxcbiAgfSxcbiAgYXNzZXRzSW5jbHVkZTogWydzcmMvYXNzZXRzLyovKionXSxcbiAgZGVmaW5lLFxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9vcC9yZXBvcy9icmlja2J1ZGR5L2RlZmluZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL29wL3JlcG9zL2JyaWNrYnVkZHkvZGVmaW5lLmNvbmZpZy50c1wiO2ltcG9ydCB7IHNwYXduU3luYyB9IGZyb20gJ25vZGU6Y2hpbGRfcHJvY2VzcydcbmltcG9ydCBmcyBmcm9tICdub2RlOmZzJ1xuaW1wb3J0IHBhY2thZ2VKc29uIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG4vLyBSZWFkIENIQU5HRUxPRy5tZCBmaWxlIGludG8gYSBzdHJpbmcuXG5jb25zdCBjaGFuZ2Vsb2cgPSBmcy5yZWFkRmlsZVN5bmMoJy4vQ0hBTkdFTE9HLm1kJywgJ3V0Zi04JylcblxuLy8gR2V0IHRoZSBjdXJyZW50IGdpdCBjb21taXQgaGFzaC5cbmNvbnN0IGdpdENvbW1pdCA9IHNwYXduU3luYygnZ2l0JywgWydyZXYtcGFyc2UnLCAnLS1zaG9ydCcsICdIRUFEJ10pXG4gIC5zdGRvdXQudG9TdHJpbmcoKVxuICAudHJpbSgpXG5cbmNvbnN0IGpzbiA9ICh2YWx1ZTogc3RyaW5nKSA9PiBKU09OLnN0cmluZ2lmeSh2YWx1ZSlcblxuLy8gRG9uJ3QgZm9yZ2V0IHRvIGFkZCB5b3VyIGFkZGVkIHZhcmlhYmxlcyB0byB2aXRlLWVudi5kLnRzIGFsc28hXG5cbi8vIFRoZXNlIHZhcmlhYmxlcyBhcmUgYXZhaWxhYmxlIGluIHlvdXIgVnVlIGNvbXBvbmVudHMgYW5kIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlaXIgdmFsdWVzIGF0IGJ1aWxkIHRpbWUuXG4vLyBUaGVzZSB3aWxsIGJlIGNvbXBpbGVkIGludG8geW91ciBhcHAuIERvbid0IHN0b3JlIHNlY3JldHMgaGVyZSFcblxuZXhwb3J0IGNvbnN0IGRlZmluZVZpdGVDb25maWcgPSB7XG4gIF9fVkVSU0lPTl9fOiBqc24ocGFja2FnZUpzb24udmVyc2lvbiksXG4gIF9fTkFNRV9fOiBqc24ocGFja2FnZUpzb24ubmFtZSksXG4gIF9fRElTUExBWV9OQU1FX186IGpzbihwYWNrYWdlSnNvbi5kaXNwbGF5TmFtZSksXG4gIF9fQ0hBTkdFTE9HX186IGpzbihjaGFuZ2Vsb2cpLFxuICBfX0dJVF9DT01NSVRfXzoganNuKGdpdENvbW1pdCksXG4gIF9fR0lUSFVCX1VSTF9fOiBqc24ocGFja2FnZUpzb24ucmVwb3NpdG9yeS51cmwpLFxuXG4gIC8vIFNldCB0aGUgSFRNTCB0aXRsZSBmb3IgYWxsIHBhZ2VzIGZyb20gcGFja2FnZS5qc29uIHNvIHlvdSBjYW4gdXNlICVIVE1MX1RJVExFJSBpbiB5b3VyIEhUTUwgZmlsZXMuXG4gICdpbXBvcnQubWV0YS5lbnYuSFRNTF9USVRMRSc6IGpzbihwYWNrYWdlSnNvbi5kaXNwbGF5TmFtZSksXG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdSLFNBQVMsV0FBVztBQUNwUyxTQUFTLGdCQUFBQSxxQkFBb0I7OztBQ0QyUCxTQUFTLHNCQUFzQjs7O0FDQS9DLFNBQVMsV0FBVzs7O0FDQTVSO0FBQUEsRUFDRSxjQUFnQjtBQUFBLElBQ2QsS0FBTztBQUFBLElBQ1AsUUFBVTtBQUFBLElBQ1YsUUFBVTtBQUFBLElBQ1YsT0FBUztBQUFBLElBQ1QsS0FBTztBQUFBLElBQ1AsY0FBYztBQUFBLElBQ2QseUJBQXlCO0FBQUEsRUFDM0I7QUFBQSxFQUNBLGFBQWU7QUFBQSxFQUNmLGlCQUFtQjtBQUFBLElBQ2pCLHdCQUF3QjtBQUFBLElBQ3hCLHNCQUFzQjtBQUFBLElBQ3RCLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLDJCQUEyQjtBQUFBLElBQzNCLGlCQUFpQjtBQUFBLElBQ2pCLGVBQWU7QUFBQSxJQUNmLGdDQUFnQztBQUFBLElBQ2hDLHNCQUFzQjtBQUFBLElBQ3RCLHFCQUFxQjtBQUFBLElBQ3JCLGdCQUFnQjtBQUFBLElBQ2hCLGNBQWdCO0FBQUEsSUFDaEIsZ0JBQWdCO0FBQUEsSUFDaEIsY0FBZ0I7QUFBQSxJQUNoQixhQUFhO0FBQUEsSUFDYixTQUFXO0FBQUEsSUFDWCxRQUFVO0FBQUEsSUFDVixTQUFXO0FBQUEsSUFDWCxTQUFXO0FBQUEsSUFDWCxVQUFZO0FBQUEsSUFDWiwrQkFBK0I7QUFBQSxJQUMvQixNQUFRO0FBQUEsSUFDUixhQUFlO0FBQUEsSUFDZixRQUFVO0FBQUEsSUFDVixZQUFjO0FBQUEsSUFDZCx3QkFBd0I7QUFBQSxJQUN4QixrQkFBa0I7QUFBQSxJQUNsQiwyQkFBMkI7QUFBQSxJQUMzQix1QkFBdUI7QUFBQSxJQUN2QixNQUFRO0FB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
