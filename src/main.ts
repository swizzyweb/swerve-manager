// @ts-ignore
import express, { Request, Response } from "@swizzyweb/express";
import { BrowserLogger, ILogger } from "@swizzyweb/swizzy-common";
import { readFileSync } from "fs";
import path from "path";
import { getArgs, installWebService } from "./utils";
import { SwizzyWinstonLogger } from "@swizzyweb/swizzy-web-service";
import os from "node:os";
import process from "node:process";

export async function run() {
  let gLogger = new SwizzyWinstonLogger({
    port: 0,
    //    appDataRoot: 'unknown',
    appName: `[swerve]`,
    hostName: os.hostname(),
    pid: process.pid,
  });
  //const PACKAGE_NAME= getPackageName(gLogger);
  //const PORT = parseInt(process.argv[3] ?? '3005');
  const app = express();

  const args = getArgs(process.argv, gLogger);

  gLogger = new SwizzyWinstonLogger({
    port: 0,
    //    logDir: args.appDataRoot,
    appName: `[swerve]`,
    hostName: os.hostname(),
    pid: process.pid,
  });

  gLogger.info(`${JSON.stringify(args)}`);

  const PORT = args.serviceArgs.port ?? 3005;
  const webServices = [];
  for (const service of args.services) {
    const packageName = service.packageJson.name;
    const importPathOrName = service.servicePath;
    const webservice = await installWebService(
      service.packageJson,
      importPathOrName,
      PORT,
      app,
      args.serviceArgs,
    );
    webServices.push(webservice);
  }

  gLogger.info(`Starting express app...`);
  app.listen(PORT, () => {
    gLogger.info(
      `${webServices
        .map((service) => {
          return service.name;
        })
        .join(",")} running on port ${PORT}`,
    );
  });
}
