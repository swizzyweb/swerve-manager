// @ts-ignore
import express, { Request, Response } from "@swizzyweb/express";
import { getPackageJsonFromDirectory, ILogger } from "@swizzyweb/swizzy-common";
import { readFileSync } from "fs";
import path from "path";
import process from "node:process";
import { IConfig, IService, KeyValue } from "../config/config";
import { SwerveConfigParser } from "../config/config-parser";
import { deepMerge } from "@swizzyweb/swizzy-common";
import { getPackageJson } from "./getPackageJson";

function getHelpText() {
  return `Help --
npm run server <serviceName> <port (optional)>
		`;
}

export function getServiceNameFromCurrentDirPackage(logger: ILogger<any>) {
  try {
    return process.cwd();
  } catch (e) {
    logger.debug(`Error getting package from current dir package.json ${e}`);
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
    let directory;
    let packageJson;
    if (!serviceName || serviceName === ".") {
      directory = getServiceNameFromCurrentDirPackage(logger);
      packageJson = getPackageJsonFromDirectory(directory);
    } else if (serviceName.startsWith(".")) {
      directory = serviceName;
      const jsonPath = path.join(directory);
      packageJson = getPackageJsonFromDirectory(path.resolve(jsonPath));
    } else {
      return getPackageJson(serviceName);
    }

    const response = {
      servicePath: directory,
      packageJson,
    };
    logger.debug(`response ${response}`);
    return response;
  } catch (e) {
    //   logger.debug("Web service name not found at argv[2]");
    const ex = {
      message: "Error getting service name",
      serviceName,
      error: e,
    };
    //    logger.debug(JSON.stringify(ex));
    throw ex;
  }
}

export interface SwerveArgs extends IConfig {
  services: KeyValue<IService>;
  port: number;
  appDataRoot?: string;
  serviceArgs?: KeyValue<any>;
  logLevel: string;
  [key: string]: any;
}

function getDefaultArgs(): SwerveArgs {
  let currentServiceName = undefined;

  return {
    logLevel: "info",
    services: {},
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

const configParser = new SwerveConfigParser();

async function getConfigValuesFromPath(
  configPath: string,
  logger: ILogger<any>,
) {
  try {
    return await configParser.parse(configPath);
    /*let data: string;
    if (configPath.startsWith(".")) {
      data = readFileSync(path.join(configPath), "utf-8");
    } else {
      data = readFileSync(configPath, "utf-8");
    }

    return JSON.parse(data);*/
  } catch (e: any) {
    logger.error(`Error occurred parsing config values from path`);
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

function tryParseNumberArg(val): number | boolean {
  try {
    return parseInt(val);
  } catch (e) {
    return false;
  }
}

function parseArgValue(val: string, logger: ILogger<any>) {
  try {
    return JSON.parse(val);
  } catch (e) {
    logger.warn(
      `Exception occurred while parsing arg value ${val}. This is sometimes expected. Error ${e}`,
    );
  }

  /*try {
    return parseNumberArg(val);
  } catch (e) {
    logger.warn(`Exception occurred parsing arg value ${val} as number`);
  }*/

  return val;
}

const DEFAULT_PORT = 3005;
export async function getArgs(
  args: string[],
  logger: ILogger<any>,
): Promise<SwerveArgs> {
  let argKey = undefined;
  let swerveArgs = getDefaultArgs();
  let configFromFile;
  const serviceCounts = new Map<string, number>();
  for (let i = 2; i < args.length; i++) {
    const nextVal = args[i];
    if (argKey) {
      if (argKey == CONFIG_ARG_KEY) {
        /*        swerveArgs.serviceConfiguration = {
          ...swerveArgs.serviceArgs,
          ...getConfigValuesFromPath(nextVal),
        };*/
        configFromFile = await getConfigValuesFromPath(nextVal, logger);
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
    const serviceName = serviceDetails.packageJson.name;
    const serviceIndex = serviceCounts.get(serviceName) ?? 0;
    serviceCounts.set(serviceName, serviceIndex + 1);
    swerveArgs.services[`${serviceDetails.packageJson.name}-${serviceIndex}`] =
      {
        serviceConfiguration: {},
        ...serviceDetails,
      };
  }

  swerveArgs.port =
    configFromFile?.port ?? swerveArgs.serviceArgs?.port ?? DEFAULT_PORT;
  /*  for (const arg of Object.keys(configFromFile ?? {})) {
    if (arg === "services") {
      continue;
    }

    swerveArgs[arg] = deepMerge(swerveArgs, configFromFile[arg]);
  }*/
  for (const serviceEntry of Object.entries(configFromFile?.services ?? {})) {
    const serviceName = serviceEntry[0];
    swerveArgs.services[serviceName] = await deepMerge(
      await deepMerge(
        swerveArgs.serviceArgs ?? {},
        serviceEntry.values() ?? {},
      ),
      configFromFile.services[serviceName],
    );
  }

  swerveArgs = deepMerge(swerveArgs, configFromFile ?? {});

  if (Object.keys(swerveArgs.services).length < 1) {
    const { servicePath, packageJson } = getService(".", logger);
    swerveArgs.services[packageJson.name] = {
      servicePath,
      packageJson,
      serviceConfiguration: swerveArgs.serviceArgs,
    };
  }

  if (
    swerveArgs.serviceArgs?.appDataRoot?.startsWith(".") ||
    swerveArgs.serviceArgs?.appDataRoot == undefined
  ) {
    const appDataRootPath = path.join(
      process.cwd(),
      //      Object.values(swerveArgs.services)[0].servicePath,
    );

    swerveArgs.appDataRoot = appDataRootPath;
    swerveArgs.serviceArgs.appDataRoot = appDataRootPath;
  } else {
    swerveArgs.appDataRoot = swerveArgs.serviceArgs.appDataRoot;
  }

  /*  if (swerveArgs.port) {
    if (typeof swerveArgs.port !== "number") {
      swerveArgs.port = parseInt(swerveArgs.port);
    } else {
      swerveArgs.port = swerveArgs.port;
    }
  } else {
    swerveArgs.port = DEFAULT_PORT;
  }*/

  //swerveArgs.serviceArgs = { ...swerveArgs.serviceArgs, ...configFromFile };
  //swerveArgs.port = port ?? DEFAULT_PORT;
  return swerveArgs;
}
