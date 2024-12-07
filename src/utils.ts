// @ts-ignore
import express, { Request, Response } from "@swizzyweb/express";
import { BrowserLogger, ILogger } from "@swizzyweb/swizzy-common";
import { readFileSync } from "fs";
import path from "path";

console.log(process.argv[1]);
function getHelpText() {
  return `Help --
npm run server <serviceName> <port (optional)>
		`;
}

function getServiceNameFromCurrentDirPackage(logger: ILogger) {
  try {
    return process.cwd();
  } catch (e) {
    logger.error(`Error getting package from current dir package.json ${e}`);
    throw e;
  }
}

function getPackageName(serviceName: string | undefined, logger: ILogger) {
  try {
    //		const serviceName = process.argv[2];
    if (!serviceName || serviceName === ".") {
      return getServiceNameFromCurrentDirPackage(logger);
    }
    return serviceName;
  } catch (e) {
    logger.error("Web service name not found at argv[2]");
    throw new Error(`Web service name must be provided as the first argument.
						${getHelpText()}`);
  }
}

export async function installWebService(
  packageName: string,
  port: number,
  expressApp: any,
  logger: ILogger,
  serviceArgs: any,
) {
  // Probably use type of express app
  try {
    logger.info(
      `Getting webservice package ${packageName} and will run on port ${port}`,
    );
    const tool = await import(packageName); //require(packageName as string);
    logger.info(`Got service with require`);
    logger.debug(JSON.stringify(tool));

    logger.info(`Getting web service from tool...`);
    const service = tool.getWebservice({ app: expressApp, serviceArgs });
    logger.info(`Got web service`);
    logger.info(`Installing web service...`);
    service.install({});
    logger.info(`Installed web service`);
    return service;
  } catch (e) {
    const exceptionMessage = `Failed to install web service, is it installed with NPM? Check package exists in node_modules
		To add, run:
			npm install ${packageName ?? "packageName"}
		args:
			packageName: ${packageName}
			port: ${port}
		exception: ${e}
		${getHelpText}`;
    logger.error(`Failed to install web service`);
    throw e; //new Error(exceptionMessage);
  }
}

export interface SwerveArgs {
  serviceNames: string[];
  port: number;
  appDataRoot: string;
  serviceArgs: any;
}

function getDefaultArgs(): SwerveArgs {
  let currentServiceName = undefined;

  return {
    serviceNames: [],
    port: 3005,
    appDataRoot: "",
    serviceArgs: {},
  };
}
const ARG_PREFIX = "--";

function cliArgToPropertyName(rawArg: string): string {
  return rawArg.replace(ARG_PREFIX, "");
}

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

    swerveArgs.serviceNames.push(getPackageName(nextVal, logger));
  }

  if (swerveArgs.serviceNames.length < 1) {
    swerveArgs.serviceNames.push(getServiceNameFromCurrentDirPackage(logger));
  }
  return swerveArgs;
}
