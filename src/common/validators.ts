// https://github.com/lyrio-dev/lyrio/blob/33c4ac58857d15a15d0f529354ceee69fc86279b/src/common/validators.ts

import { registerDecorator, ValidationOptions } from 'class-validator';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function If<T>(
  callback: (value: T) => boolean,
  validationOptions?: ValidationOptions,
) {
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

// class-validator's IsNumberString accepts floating numbers only, but I
// want to validate if it's a integer
export function IsIntString(validationOptions?: ValidationOptions) {
  return If(
    value => typeof value === 'string' && Number.isInteger(Number(value)),
    validationOptions,
  );
}

// class-validator's IsPort accepts strings only, but I prefer
// writing port numbers as number
export function IsPortNumber(validationOptions?: ValidationOptions) {
  return If(
    value => Number.isInteger(value) && value >= 1 && value <= 65535,
    validationOptions,
  );
}

// A username is a string of 3 ~ 24 ASCII characters, and each character
// is a uppercase / lowercase letter or a number or any of '-_.#$' and is
// NOT '%'.
export function isUsername(str: string) {
  return /^[a-zA-Z0-9\-_.#$]{3,24}$/.test(str);
}

export function IsUsername(validationOptions?: ValidationOptions) {
  return If(value => typeof value === 'string' && isUsername(value), validationOptions);
}

// A group name is a string of 1 ~ 48 ASCII characters, and each character
// is a uppercase / lowercase letter or a number or any of ' :@~-_.#$/'
// and is NOT '%'.
export function IsGroupName(validationOptions?: ValidationOptions) {
  return If(
    value => typeof value === 'string' && /^[a-zA-Z0-9 :@~\-_.#$/]{1,48}$/.test(value),
    validationOptions,
  );
}

export function isValidFilename(filename: string): boolean {
  const forbiddenCharacters = ['/', '\x00'];
  const reservedFilenames = ['.', '..'];
  return (
    forbiddenCharacters.every(ch => filename.indexOf(ch) === -1) &&
    !reservedFilenames.includes(filename)
  );
}

export function IsValidFilename(validationOptions?: ValidationOptions) {
  return If(
    value => typeof value === 'string' && isValidFilename(value),
    validationOptions,
  );
}
