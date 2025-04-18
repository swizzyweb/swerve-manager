// @ts-ignore
import express, { Request, Response } from "@swizzyweb/express";
import { getPackageJsonFromDirectory, ILogger } from "@swizzyweb/swizzy-common";
import { readFileSync } from "fs";
import path from "path";
import process from "node:process";

console.log(process.argv[1]);
function getHelpText() {
  return `Help --
npm run server <serviceName> <port (optional)>
		`;
}

export function getServiceNameFromCurrentDirPackage(logger: ILogger<any>) {
  try {
    return process.cwd();
  } catch (e) {
    logger.info(`Error getting package from current dir package.json ${e}`);
    throw e;
  }
}
/**
 *
 * */
function getAppDataRoot(
  appDataRootPath: string | undefined,
  logger: ILogger<any>,
) {
  try {
    //		const serviceName = process.argv[2];
    let directory;
    if (!appDataRootPath || appDataRootPath === ".") {
      directory = getServiceNameFromCurrentDirPackage(logger);
    } else {
      directory = appDataRootPath;
    }
    return directory;
  } catch (e) {
    throw {
      message: `Unable to get app data root ${appDataRootPath}`,
      exception: e,
    };
  }
}

function getService(serviceName: string | undefined, logger: ILogger<any>) {
  try {
    //		const serviceName = process.argv[2];
    let directory;
    let packageJson;
    if (!serviceName || serviceName === ".") {
      directory = getServiceNameFromCurrentDirPackage(logger);
      packageJson = getPackageJsonFromDirectory(directory);
    } else {
      directory = serviceName;
      packageJson = getPackageJsonFromDirectory(
        path.join(path.dirname(require.resolve(directory))),
      );
    }

    const response = {
      servicePath: directory,
      packageJson,
    };
    logger.info(`response ${response}`);
    return response;
  } catch (e) {
    logger.info("Web service name not found at argv[2]");
    const ex = {
      message: "Error getting service name",
      serviceName,
      error: e,
    };
    console.error(ex);
    throw ex;
  }
}

export interface SwerveArgs {
  services: {
    servicePath: string;
    packageJson: any;
  }[];
  port: number;
  appDataRoot?: string;
  serviceArgs: any;
}

function getDefaultArgs(): SwerveArgs {
  let currentServiceName = undefined;

  return {
    services: [],
    port: 3005,
    //appDataRoot: path.join(__dirname + "../../appdata/"),
    serviceArgs: {},
  };
}
const ARG_PREFIX = "--";
const CONFIG_ARG_KEY = "config";

function cliArgToPropertyName(rawArg: string): string {
  return rawArg.replace(ARG_PREFIX, "");
}

function getConfigValuesFromPath(configPath: string) {
  try {
    let data: string;
    if (configPath.startsWith(".")) {
      data = readFileSync(path.join(configPath), "utf-8");
    } else {
      data = readFileSync(configPath, "utf-8");
    }

    return JSON.parse(data);
  } catch (e: any) {
    throw {
      message:
        "Unexpected error occurred when attempting to read serviceConfiguration file",
      configFilePath: configPath,
      error: e,
    };
  }
}
const topLevelArgs = new Set();
topLevelArgs.add("port");
function isTopLevelArg(key: string) {
  return topLevelArgs.has(key);
}

function parseArgValue(val: string, logger: ILogger<any>) {
  try {
    return JSON.parse(val);
  } catch (e) {
    logger.warn(
      `Exception occurred while parsing arg value ${val}. This is sometimes expected. Error ${e}`,
    );
    return val;
  }
}

const DEFAULT_PORT = 3005;
export function getArgs(args: string[], logger: ILogger<any>): SwerveArgs {
  let argKey = undefined;
  let swerveArgs = getDefaultArgs();
  for (let i = 2; i < args.length; i++) {
    const nextVal = args[i];
    if (argKey) {
      if (argKey == CONFIG_ARG_KEY) {
        swerveArgs.serviceArgs = {
          ...swerveArgs.serviceArgs,
          ...getConfigValuesFromPath(nextVal),
        };
        argKey = undefined;
        continue;
      }
      swerveArgs.serviceArgs[argKey] = parseArgValue(nextVal, logger);
      argKey = undefined;
      continue;
    }
    if (nextVal.startsWith(ARG_PREFIX)) {
      argKey = cliArgToPropertyName(nextVal);
      continue;
    }

    const serviceDetails = getService(nextVal, logger);
    swerveArgs.services.push({ ...serviceDetails });
  }

  if (swerveArgs.services.length < 1) {
    const { servicePath, packageJson } = getService(".", logger);
    swerveArgs.services.push({
      servicePath,
      packageJson,
    });
  }

  if (
    swerveArgs.serviceArgs.appDataRoot?.startsWith(".") ||
    swerveArgs.serviceArgs.appDataRoot == undefined
  ) {
    const appDataRootPath = path.join(swerveArgs.services[0].servicePath);

    swerveArgs.serviceArgs.appDataRoot = appDataRootPath;
    swerveArgs.appDataRoot = appDataRootPath;
  } else {
    swerveArgs.appDataRoot = swerveArgs.serviceArgs.appDataRoot;
  }

  if (swerveArgs.serviceArgs.port) {
    if (typeof swerveArgs.serviceArgs.port !== "number") {
      swerveArgs.port = parseInt(swerveArgs.serviceArgs.port);
    } else {
      swerveArgs.port = swerveArgs.serviceArgs.port;
    }
  } else {
    swerveArgs.port = DEFAULT_PORT;
  }
  //swerveArgs.port = port ?? DEFAULT_PORT;
  return swerveArgs;
}
