import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "TranslateKit",
  outfile: "dist/translatekit.js",
  target: ["es2017"],
  platform: "browser",
});

console.log("✅ @translatekit/sdk built → dist/translatekit.js");
