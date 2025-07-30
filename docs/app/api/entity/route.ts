import { makeApiController } from "../../../../dist/server.mjs";
import { zod } from "nexting";


export const POST = makeApiController(
  async ({ message }) => {
    return {
      message: message,
    };
  }, {
    validationSchema: zod.object({
      message: zod.string(),
    }),
  }
);
