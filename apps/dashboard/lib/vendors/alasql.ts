// alasql's package exports field maps the "node" condition to alasql.fs.js,
// which pulls in react-native-fs (a TypeScript file with .js extension that
// bundlers can't parse). This shim imports the plain build via a relative
// file path, which bypasses the package exports field entirely.
import type alasqlType from "alasql";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const alasql = require("../../node_modules/alasql/dist/alasql.js") as typeof alasqlType;

export default alasql;
