import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  registerLogTransport,
  resetLogger,
  setLoggerOverride,
  type LogTransportRecord,
} from "../logger.js";

export function createWarnLogCapture(_prefix: string) {
  const records: LogTransportRecord[] = [];
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-warn-capture-"));
  const tmpFile = path.join(tmpDir, "warn.log");
  setLoggerOverride({
    level: "warn",
    consoleLevel: "silent",
    file: tmpFile,
  });
  const unregister = registerLogTransport((record) => {
    records.push(record);
  });
  return {
    findText(needle: string): string | undefined {
      return records
        .flatMap((record) => Object.values(record))
        .filter((value): value is string => typeof value === "string")
        .find((value) => value.includes(needle));
    },
    cleanup() {
      unregister();
      setLoggerOverride(null);
      resetLogger();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    },
  };
}
