import { TransformFnParams } from "class-transformer";

export function transformBoolean({ value }: TransformFnParams) {
  if ([true, "enabled", "true", 1, "1"].includes(value)) {
    return true;
  }

  if ([false, "disabled", "false", 0, "0"].includes(value)) {
    return false;
  }

  return value;
}

export function transformStringArray({ value }: TransformFnParams) {
  if (typeof value === "string") {
    return value
      .trim()
      .split(",")
      .map(x => x.trim());
  }
  return value;
}

export function transformNumberArray({ value }: TransformFnParams) {
  if (typeof value === "string") {
    return value
      .trim()
      .split(",")
      .map(x => Number(x.trim()));
  }
  return value;
}
