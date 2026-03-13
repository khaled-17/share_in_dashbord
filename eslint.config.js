import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import checkFile from "eslint-plugin-check-file";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "*.timestamp-*"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "check-file": checkFile,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ═══════════════════════════════════════════
      // ⚛️  React Rules
      // ═══════════════════════════════════════════
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ═══════════════════════════════════════════
      // 📝  TypeScript Naming Conventions
      // ═══════════════════════════════════════════
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_", // تجاهل المتغيرات اللي بتبدأ بـ _
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports", // استخدم import type للأنواع
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        // المتغيرات والدوال: camelCase
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // الدوال: camelCase أو PascalCase (للـ Components)
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        // الأنواع والـ Interfaces: PascalCase
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // الـ Enums: PascalCase
        {
          selector: "enum",
          format: ["PascalCase"],
        },
        // أعضاء الـ Enum: UPPER_CASE أو PascalCase
        {
          selector: "enumMember",
          format: ["UPPER_CASE", "PascalCase"],
        },
      ],

      // ═══════════════════════════════════════════
      // 📂  File Naming Rules
      // ═══════════════════════════════════════════
      // Components: PascalCase (مثال: Sidebar.tsx, Reports.tsx)
      "check-file/filename-naming-convention": [
        "warn",
        {
          "**/*.tsx": "PASCAL_CASE",
          "**/*.ts": "CAMEL_CASE",
        },
        {
          ignoreMiddleExtensions: true, // يتجاهل .test.ts, .spec.ts
        },
      ],
      // المجلدات: PascalCase أو camelCase
      "check-file/folder-naming-convention": [
        "warn",
        {
          "src/pages/**/": "PASCAL_CASE",
          "src/components/**/": "CAMEL_CASE",
        },
      ],

      // ═══════════════════════════════════════════
      // 🧹  General Code Quality
      // ═══════════════════════════════════════════
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"], // اسمح بـ console.warn و console.error بس
        },
      ],
      "no-debugger": "error", // امنع debugger في الكود
      "no-duplicate-imports": "error", // امنع استيراد نفس الملف مرتين
      "prefer-const": "warn", // استخدم const لو المتغير مش بيتغير
      "no-var": "error", // امنع var واستخدم let/const
      eqeqeq: ["error", "always"], // استخدم === بدل ==
      "no-nested-ternary": "off", // السماح في واجهات العرض الحالية
      "no-unneeded-ternary": "warn", // تحذير من x ? true : false
      "prefer-template": "warn", // استخدم template literals بدل +
      "no-else-return": "warn", // لو عملت return جوه if مش محتاج else
      "object-shorthand": "warn", // استخدم { name } بدل { name: name }
      "prefer-destructuring": [
        "warn",
        {
          array: false,
          object: true, // استخدم const { x } = obj بدل const x = obj.x
        },
      ],
    },
  },
  {
    files: ["prisma/seed.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: [
      "src/pages/Checks/Checks.tsx",
      "src/pages/Customers/CustomerDetails.tsx",
      "src/pages/Quotations/QuotationDetails.tsx",
      "src/pages/Settings/Settings.tsx",
      "src/pages/Suppliers/SupplierDetails.tsx",
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["src/context/AuthContext.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/main.tsx", "src/services/work_orders.ts", "src/vite-env.d.ts"],
    rules: {
      "check-file/filename-naming-convention": "off",
    },
  },
  {
    files: ["src/vite-env.d.ts"],
    rules: {
      "@typescript-eslint/naming-convention": "off",
    },
  },
);
