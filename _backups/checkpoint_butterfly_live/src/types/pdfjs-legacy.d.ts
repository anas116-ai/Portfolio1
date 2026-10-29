/* The legacy build is the supported pdf.js entry for Node (the route
   uploader renders with it), but it ships no bundled declaration file —
   its API is identical to the typed main entry, so re-export those types. */
declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export * from "pdfjs-dist";
}
