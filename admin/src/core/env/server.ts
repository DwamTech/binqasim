import "server-only";

import { validateServerEnvironment } from "./server.schema";

export {
  validateServerEnvironment,
  type ServerEnvironment,
} from "./server.schema";

export const serverEnv = validateServerEnvironment();
