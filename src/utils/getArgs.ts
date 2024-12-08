// @ts-ignore
import express, { Request, Response } from "@swizzyweb/express";
import {
  BrowserLogger,
  getPackageJsonFromDirectory,
  ILogger,
} from "@swizzyweb/swizzy-common";
import { SwizzyWinstonLogger } from "@swizzyweb/swizzy-web-service";
import { readFileSync } from "fs";
import path from "path";
import os from "node:os";
import process from "node:process";

console.log(process.argv[1]);
function getHelpText() {
  return `Help --
npm run server <serviceName> <port (optional)>
		`;
}

export function getServiceNameFromCurrentDirPackage(logger: ILogger) {
  try {
    return process.cwd();
  } catch (e) {
    logger.error(`Error getting package from current dir package.json ${e}`);
    throw e;
  }
}

function getService(serviceName: string | undefined, logger: ILogger) {
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
        path.join(path.dirname(require.resolve(directory)), "../"),
      );
    }

    //    const packageJson = getPackageJsonFromDirectory(directory);
    //const packageJson = getPackageJsonFromDirectory(
    // path.dirname(require.resolve(directory)),
    //);
    const response = {
      servicePath: directory,
      packageJson,
    };
    logger.info(`response ${response}`);
    return response;
  } catch (e) {
    logger.error("Web service name not found at argv[2]");
    //throw new Error(`Web service name must be provided as the first argument.
    //			${getHelpText()}`);
    throw e;
  }
}

export interface SwerveArgs {
  services: {
    servicePath: string;
    packageJson: any;
  }[];
  port: number;
  appDataRoot: string;
  serviceArgs: any;
}

function getDefaultArgs(): SwerveArgs {
  let currentServiceName = undefined;

  return {
    services: [],
    port: 3005,
    appDataRoot: path.join(__dirname + "/../appdata/"),
    serviceArgs: {},
  };
}
const ARG_PREFIX = "--";

function cliArgToPropertyName(rawArg: string): string {
  return rawArg.replace(ARG_PREFIX, "");
}

const DEFAULT_PORT = 3005;
export function getArgs(logger: ILogger): SwerveArgs {
  const args = process.argv;
  let argKey = undefined;
  let swerveArgs = getDefaultArgs();
  for (let i = 2; i < args.length; i++) {
    const nextVal = args[i];
    if (argKey) {
      swerveArgs.serviceArgs[argKey] = nextVal;
      argKey = undefined;
      continue;
    }
    if (nextVal.startsWith(ARG_PREFIX)) {
      argKey = cliArgToPropertyName(nextVal);
      continue;
    }

    /*if (nextVal == '.') {
        swerveArgs.serviceNames.push(getServiceNameFromCurrentDirPackage());
      }*/

    swerveArgs.services.push({ ...getService(nextVal, logger) });
  }

  if (!swerveArgs.serviceArgs?.appDataRoot) {
    swerveArgs.serviceArgs.appDataRoot = path.join(__dirname, "../appdata/");
  }
  if (swerveArgs.services.length < 1) {
    const servicePath = getServiceNameFromCurrentDirPackage(logger);
    const packageJson = getPackageJsonFromDirectory(servicePath);
    //    swerveArgs.serviceNames.push(serviePath);
    swerveArgs.services.push({
      servicePath,
      packageJson,
    });
  }

  if (!swerveArgs.port) {
    swerveArgs.port = DEFAULT_PORT;
  }
  return swerveArgs;
}
