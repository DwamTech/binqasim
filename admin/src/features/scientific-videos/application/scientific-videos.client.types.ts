export {
  createScientificVideoFormData,
  type ScientificVideoFormFiles,
  type ScientificVideoFormValues,
} from "../domain/scientific-videos";
import type { z } from "zod";
import {
  scientificVideoDeleteSchema,
  scientificVideoMutationSchema,
} from "../domain/scientific-videos";
export type ScientificVideoMutationResponse = z.infer<
  typeof scientificVideoMutationSchema
>;
export type ScientificVideoDeleteResponse = z.infer<
  typeof scientificVideoDeleteSchema
>;
