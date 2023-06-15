// https://github.com/lyrio-dev/lyrio/blob/33c4ac58857d15a15d0f529354ceee69fc86279b/src/common/validators.ts

import {
  isInt,
  IsIpVersion,
  isNumberString,
  isString,
  max,
  min,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

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
  return If(value => isString(value) && isInt(Number(value)), {
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
  return If(value => isInt(value) && min(value, 1) && max(value, 65535), {
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
  return If(value => isString(value) && isUsername(value), {
    message: ({ property }) =>
      `${property} must be a string of 3 ~ 24 ASCII characters and contain only letters, numbers and "-_.#$"`,
    ...validationOptions,
  });
}

export function isValidFilename(filename: string): boolean {
  const forbiddenCharacters = ["/", "\x00"];
  const reservedFilenames = [".", ".."];
  return forbiddenCharacters.every(ch => filename.indexOf(ch) === -1) && !reservedFilenames.includes(filename);
}

export function IsValidFilename(validationOptions?: ValidationOptions) {
  return If(value => isString(value) && isValidFilename(value), validationOptions);
}

export function isCIDR(value: string, version?: IsIpVersion): boolean {
  const v4Regex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/i;
  const v6Regex =
    /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/i;

  if (version === 4 || version === "4") {
    return v4Regex.test(value);
  } else if (version === 6 || version === "6") {
    return v6Regex.test(value);
  }

  return v4Regex.test(value) || v6Regex.test(value);
}

export function IsCIDR(version?: IsIpVersion, validationOptions?: ValidationOptions) {
  return If(value => isString(value) && isCIDR(value, version), {
    message: ({ property }) => `${property} must be a CIDR`,
    ...validationOptions,
  });
}
