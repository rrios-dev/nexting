import { makeApiController } from "../../../../../dist/server.mjs";
import { zod } from "nexting";
import { StatusCodes } from "http-status-codes";

export const POST = makeApiController(
  async ({ body, params }) => {
    return {
      data: {
        message: body.message,
        timestamp: new Date().toISOString(),
        processed: true,
        id: params.id,
      },
      status: StatusCodes.CREATED,
    };
  },
  {
    bodySchema: zod.object({
      message: zod.string(),
    }),
    paramsSchema: zod.object({
      id: zod.string(),
    }),
  }
);
