// https://github.com/lyrio-dev/lyrio/blob/33c4ac58857d15a15d0f529354ceee69fc86279b/src/common/validators.ts

import { isIP, isNumberString, max, min, registerDecorator, ValidationOptions } from "class-validator";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function If<T>(callback: (value: T) => boolean, validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: T) {
          return callback(value);
        },
      },
    });
  };
}

// class-validator's IsNumberString accepts floating numbers only,
// but I want to validate if it's an integer
export function IsIntString(validationOptions?: ValidationOptions) {
  return If(value => typeof value === "string" && Number.isInteger(Number(value)), {
    message: ({ property }) => `${property} must be an integer string`,
    ...validationOptions,
  });
}

// class-validator's Max and Min accepts numbers only,
// but I want to validate number strings
export function MaxNumberString(maxValue: number, validationOptions?: ValidationOptions) {
  return If(value => isNumberString(value) && max(Number(value), maxValue), {
    message: ({ property }) => `${property} must not be greater than ${maxValue}`,
    ...validationOptions,
  });
}
export function MinNumberString(minValue: number, validationOptions?: ValidationOptions) {
  return If(value => isNumberString(value) && min(Number(value), minValue), {
    message: ({ property }) => `${property} must not be less than ${minValue}`,
    ...validationOptions,
  });
}

// class-validator's IsPort accepts strings only,
// but I prefer writing port numbers as number
export function IsPortNumber(validationOptions?: ValidationOptions) {
  return If(value => Number.isInteger(value) && min(value, 1) && max(value, 65535), {
    message: ({ property }) => `${property} must be a port number`,
    ...validationOptions,
  });
}

// A username is a string of 3 ~ 24 ASCII characters, and each character
// is a uppercase / lowercase letter or a number or any of '-_.#$' and is
// NOT '%'.
export function isUsername(str: string) {
  return /^[a-zA-Z0-9\-_.#$]{3,24}$/.test(str);
}

export function IsUsername(validationOptions?: ValidationOptions) {
  return If(value => typeof value === "string" && isUsername(value), {
    message: ({ property }) => `${property} must contain only letters, numbers and "-_.#"`,
    ...validationOptions,
  });
}

export function isValidFilename(filename: string): boolean {
  const forbiddenCharacters = ["/", "\x00"];
  const reservedFilenames = [".", ".."];
  return forbiddenCharacters.every(ch => filename.indexOf(ch) === -1) && !reservedFilenames.includes(filename);
}

export function IsValidFilename(validationOptions?: ValidationOptions) {
  return If(value => typeof value === "string" && isValidFilename(value), validationOptions);
}

export function isCIDR(value: string): boolean {
  const parts = value.split("/");
  if (parts.length != 2) return false;
  const mask = Number(parts[1]);
  return (
    Number.isInteger(mask) &&
    ((isIP(parts[0], 4) && min(mask, 0) && max(mask, 32)) || (isIP(parts[0], 6) && mask >= 0 && mask <= 128))
  );
}

export function IsCIDR(validationOptions?: ValidationOptions) {
  return If(value => typeof value === "string" && isCIDR(value), {
    message: ({ property }) => `${property} must be a CIDR`,
    ...validationOptions,
  });
}
