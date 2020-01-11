namespace App {
  // Validation
  // first we define the type of validate object
  export interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function validate(args: Validatable) {
    let isValid: boolean = true;
    if (args.required) {
      isValid = isValid && args.value.toString().trim().length !== 0;
    }
    if (
      args.minLength != null &&
      typeof args.value === "string" &&
      isValid === true
    ) {
      isValid = isValid && args.value.length > args.minLength;
    }
    if (
      args.maxLength != null &&
      typeof args.value === "string" &&
      isValid === true
    ) {
      isValid = isValid && args.value.length < args.maxLength;
    }
    if (args.min != null && typeof args.value === "number") {
      isValid = isValid && args.value >= args.min;
    }
    if (args.max != null && typeof args.value === "number") {
      isValid = isValid && args.value <= args.max;
    }
    //* Will later implement the check for the case when user enter a number in string field
    //* Because NaN === NaN is false
    // if (typeof args.value === "string") {
    //   console.log(+args.value);
    //   console.log(+args.value === NaN);
    //   // isValid = false;
    // }

    return isValid;
  }
}
