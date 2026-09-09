export type LoginCredentials = {
  identity: string;
  password: string;
};

export type LoginFieldErrors = Partial<
  Record<keyof LoginCredentials, string[]>
>;

export function validateLoginCredentials(
  credentials: LoginCredentials,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!credentials.identity.trim()) {
    errors.identity = ["أدخل البريد الإلكتروني أو اسم المستخدم"];
  }
  if (!credentials.password) {
    errors.password = ["أدخل كلمة المرور"];
  }

  return errors;
}
