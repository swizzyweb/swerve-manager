import { SwizzyWinstonLogger } from "@swizzyweb/swizzy-web-service";
import { getArgs } from "../src/utils";
import path from "node:path/posix";

const logger = new SwizzyWinstonLogger({
  port: 80,
  appName: `AppName`,
  appDataRoot: "./log/test-log.json",
  hostName: "HOSTNAME",
  pid: process.pid,
});

describe("sum", () => {
  it("Sets port and custom arg", () => {
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      //"--appDataRoot",
      //      ".",
      "--someCustomArg",
      "JasonIsTheBest",
    ];
    let result = getArgs(args, logger);
    expect(result.port).toEqual(80);
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");
  });

  it("sets appDataRoot", () => {
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      "--appDataRoot",
      ".",
      "--someCustomArg",
      "JasonIsTheBest",
    ];
    let result = getArgs(args, logger);
    expect(result.port).toEqual(80);
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");
  });

  it("Throws on invalid config file path", () => {
    const configPath = "/some/invalid/path";
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      "--appDataRoot",
      ".",
      "--someCustomArg",
      "JasonIsTheBest",
      "--config",
      configPath,
    ];
    try {
      let result = getArgs(args, logger);
    } catch (e) {
      expect(e).toEqual({
        message:
          "Unexpected error occurred when attempting to read serviceConfiguration file",
        configFilePath: configPath,
        error: expect.anything(),
      });
    }
  });
  it("Should read config values from config", () => {
    const configPath = path.join(__dirname, "./config/serviceConfig.json");
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      "--appDataRoot",
      ".",
      "--someCustomArg",
      "JasonIsTheBest",
      "--config",
      configPath,
    ];
    let result = getArgs(args, logger);
    expect(result.serviceArgs.someOtherArgFromConfig).toEqual(
      "ThisIsTheArgValue",
    );
    expect(result.port).toEqual(80);
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");

    expect(result.serviceArgs.someNumberINeed).toEqual(100);
    expect(result.serviceArgs.shouldTimeout).toEqual(true);
    expect(result.serviceArgs.nestedJson).toEqual({
      hello: "world",
      none: false,
    });
  });

  it("Should override parameters in order of args, config file last", () => {
    const configPath = path.join(__dirname, "./config/serviceConfig.json");
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      "--appDataRoot",
      ".",
      "--someCustomArg",
      "JasonIsTheBest",
      "--someNumberINeed",
      "1000",
      "--config",
      configPath,
    ];
    let result = getArgs(args, logger);
    expect(result.serviceArgs.someOtherArgFromConfig).toEqual(
      "ThisIsTheArgValue",
    );
    expect(result.port).toEqual(80);
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");

    expect(result.serviceArgs.someNumberINeed).toEqual(100);
    expect(result.serviceArgs.shouldTimeout).toEqual(true);
    expect(result.serviceArgs.nestedJson).toEqual({
      hello: "world",
      none: false,
    });
  });

  it("Should override parameters in order of args, config file first", () => {
    const configPath = path.join(__dirname, "./config/serviceConfig.json");
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      "--appDataRoot",
      ".",
      "--someCustomArg",
      "JasonIsTheBest",
      "--config",
      configPath,
      "--someNumberINeed",
      "1000",
    ];
    let result = getArgs(args, logger);
    expect(result.serviceArgs.someOtherArgFromConfig).toEqual(
      "ThisIsTheArgValue",
    );
    expect(result.port).toEqual(80);
    expect(result.serviceArgs.appDataRoot).toEqual(path.join(__dirname, ".."));
    expect(result.serviceArgs.appDataRoot).toEqual(path.join(__dirname, ".."));
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");

    expect(result.serviceArgs.someNumberINeed).toEqual(1000);
    expect(result.serviceArgs.shouldTimeout).toEqual(true);
    expect(result.serviceArgs.nestedJson).toEqual({
      hello: "world",
      none: false,
    });
  });

  it("Should getService from args", () => {
    const args = [
      "/path/to/package/",
      "run.js",
      path.join(__dirname, "../package.json"),
      "--port",
      "80",
      "--appDataRoot",
      ".",
      "--someCustomArg",
      "JasonIsTheBest",
    ];
    let result = getArgs(args, logger);
    expect(result.port).toEqual(80);
    //    expect(result.serviceArgs.appDataRoot).toEqual(".");
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");
  });

  it("Should set appDataRoot to current package root by default", () => {
    const configPath = path.join(__dirname, "./config/serviceConfig.json");
    const args = [
      "/path/to/package/",
      "run.js",
      "--port",
      "80",
      "--someCustomArg",
      "JasonIsTheBest",
      "--config",
      configPath,
      "--someNumberINeed",
      "1000",
    ];
    let result = getArgs(args, logger);
    expect(result.serviceArgs.someOtherArgFromConfig).toEqual(
      "ThisIsTheArgValue",
    );
    expect(result.port).toEqual(80);
    expect(result.serviceArgs.appDataRoot).toEqual(path.join(__dirname, ".."));
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");

    expect(result.serviceArgs.someNumberINeed).toEqual(1000);
    expect(result.serviceArgs.shouldTimeout).toEqual(true);
    expect(result.serviceArgs.nestedJson).toEqual({
      hello: "world",
      none: false,
    });
  });
  it("Should create multiple services", () => {
    const configPath = path.join(__dirname, "./config/serviceConfig.json");
    const args = [
      "/path/to/package/",
      "run.js",
      ".",
      "--port",
      "80",
      "--someCustomArg",
      "JasonIsTheBest",
      "--config",
      configPath,
      "--someNumberINeed",
      "1000",
      ".",
      "--port",
      "91",
    ];
    let result = getArgs(args, logger);
    expect(result.serviceArgs.someOtherArgFromConfig).toEqual(
      "ThisIsTheArgValue",
    );
    expect(result.port).toEqual(91);
    expect(result.serviceArgs.appDataRoot).toEqual(path.join(__dirname, ".."));
    expect(result.serviceArgs.someCustomArg).toEqual("JasonIsTheBest");

    expect(result.serviceArgs.someNumberINeed).toEqual(1000);
    expect(result.serviceArgs.shouldTimeout).toEqual(true);
    expect(result.serviceArgs.nestedJson).toEqual({
      hello: "world",
      none: false,
    });
    expect(result.services.length).toEqual(2);
  });
  it("Should create absolute path appdata directory", () => {
    const configPath = path.join(__dirname, "./config/serviceConfig.json");
    const appDataRoot = "/tmp/swizzy-dyn-serve-web-service";
    const args = [
      "/path/to/package/",
      "run.js",
      ".",
      "--port",
      "80",
      "--someCustomArg",
      "JasonIsTheBest",
      //"--config",
      //configPath,
      "--someNumberINeed",
      "1000",
      ".",
      "--port",
      "91",
      "--appDataRoot",
      appDataRoot,
    ];
    let result = getArgs(args, logger);
    expect(result.appDataRoot).toEqual(appDataRoot);
  });
});
