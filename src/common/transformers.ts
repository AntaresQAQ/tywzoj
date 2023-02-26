/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransformFnParams } from "class-transformer";

export type TransformerFactory<T = undefined> = (options?: T) => (props: TransformFnParams) => any;

export const booleanTransformerFactory: TransformerFactory<{
  /**
   * Values that need to be converted to true
   * @default [true, "enabled", "true", "on", 1, "1"]
   */
  trueValues?: any[];
  /**
   * Values that need to be converted to false
   * @default [false, "disabled", "false", "off", 0, "0"]
   */
  falseValues?: any[];
}> = (options = {}) => {
  const {
    trueValues = [true, "enabled", "true", "on", 1, "1"],
    falseValues = [false, "disabled", "false", "off", 0, "0"],
  } = options;

  return ({ value }) => {
    if (trueValues.includes(value)) {
      return true;
    }

    if (falseValues.includes(value)) {
      return false;
    }

    return value;
  };
};

export const arrayTransformerFactory: TransformerFactory<{
  /**
   * A substring that the string can split to an array by
   * @default ","
   */
  split?: string;
  /**
   * A function to convert each item
   * @param {string} value Each strings in the array
   * @return {any} Converted value
   */
  transformItem?: (value: string) => any;
}> = (options = {}) => {
  const { split = ",", transformItem = value => value } = options;

  return ({ value }) => {
    if (typeof value === "string") {
      return value
        .trim()
        .split(split)
        .map(x => transformItem(x.trim()));
    }
    return value;
  };
};
