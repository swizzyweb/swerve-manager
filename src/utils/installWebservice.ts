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
import { getServiceNameFromCurrentDirPackage } from "./getArgs";
export async function installWebService(
  packageJson: any,
  importPathOrName: string,
  port: number,
  expressApp: any,
  serviceArgs: any,
) {
  const packageName = importPathOrName;
  // Probably use type of express app

  serviceArgs.appDataRoot;
  const logger = new SwizzyWinstonLogger({
    port,
    appName: `${packageJson.name}`,
    appDataRoot: serviceArgs.appDataRoot,
    hostName: os.hostname(),
    pid: process.pid,
  });
  try {
    logger.info(
      `Getting webservice package ${packageName} and will run on port ${port}`,
    );
    logger.info(`Getting tool with path: ${importPathOrName}`);
    const tool = await require(importPathOrName); //require(packageName as string);
    logger.info(`Got service with require`);
    logger.debug(JSON.stringify(tool));

    logger.info(`Getting web service from tool...`);
    const service = tool.getWebservice({
      app: expressApp,
      packageName,
      serviceArgs: { ...serviceArgs, packageJson },
      logger,
    });
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
		exception: ${e}`;
    //		${getHelpText}`;
    logger.error(`Failed to install web service`);
    throw e; //new Error(exceptionMessage);
  }
}
