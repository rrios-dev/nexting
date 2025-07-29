import main from "./main";

describe("main", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create a spy on console.log
    consoleSpy = jest.spyOn(console, "log");
  });

  afterEach(() => {
    // Restore the spy after each test
    consoleSpy.mockRestore();
  });

  it('should print "Hello, world!" to the console', () => {
    // Call the main function
    main();

    // Verify that console.log was called with the correct message
    expect(consoleSpy).toHaveBeenCalledWith("Hello, world!");
  });
});
