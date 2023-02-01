import process from "process";
import util from "util";

export function format(format: string, ...param: unknown[]) {
  return util.format(format, ...param);
}

// check undefined and NaN, null and "" are excused
export function isEmptyValues(...values: unknown[]) {
  return values.reduce((pre, cur) => pre && (cur === undefined || (typeof cur === "number" && isNaN(cur))), true);
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
