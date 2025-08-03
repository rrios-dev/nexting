"use server";

import { makeServerAction } from "nexting";
import { z } from "zod";

// Simple test server action for testing purposes
const testServerAction = makeServerAction(
  async (props) => {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      message: `Hello ${props.name}!`,
      timestamp: new Date().toISOString(),
    };
  },
  {
    validationSchema: z.object({
      name: z.string().min(1, "Name is required"),
    }),
  }
);

export default testServerAction;
