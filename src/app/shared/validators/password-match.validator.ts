// src/app/shared/validators/password-match.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirm'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey)?.value;
    const confirm = control.get(confirmKey)?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  };
}
