import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Tambahkan ini:
  {
    ignores: ["node_modules", ".next", "out"],
  },

  // Ini tetap seperti sebelumnya:
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      quotes: ["error", "double"], // Paksa penggunaan double quotes
      // kamu bisa tambahkan aturan lain di sini
    },
  },
];

export default eslintConfig;
