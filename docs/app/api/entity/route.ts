import { makeApiController } from "../../../../dist/server.mjs";
import { zod } from "nexting";
import { StatusCodes } from "http-status-codes";

export const POST = makeApiController(
  async ({ body }) => {
    return {
      data: {
        message: body.message,
        timestamp: new Date().toISOString(),
        processed: true,
      },
      status: StatusCodes.CREATED
    };
  }, {
    bodySchema: zod.object({
      message: zod.string(),
    }),
  }
);
