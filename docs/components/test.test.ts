import testServerAction from "../actions/test-server-action";

describe("Test Component Integration", () => {
  it("should call testServerAction correctly", async () => {
    const result = await testServerAction({ name: "John" });

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toHaveProperty("message");
      expect(result.data).toHaveProperty("timestamp");
      expect(result.data.message).toBe("Hello John!");
      expect(typeof result.data.timestamp).toBe("string");
    }
  });

  it("should handle validation errors", async () => {
    const result = await testServerAction({ name: "" });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toHaveProperty("code");
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
