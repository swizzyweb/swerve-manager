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

  try {
    //const PACKAGE_NAME= getPackageName(gLogger);
    //const PORT = parseInt(process.argv[3] ?? '3005');
    const app = express();

    const args = await getArgs(process.argv, gLogger);

    /*    gLogger = new SwizzyWinstonLogger({
      port: 0,
      //    logDir: args.appDataRoot,
      appName: `[swerve]`,
      hostName: os.hostname(),
      pid: process.pid,
    });*/

    gLogger.debug(`Swerve Args: ${JSON.stringify(args)}`);

    const PORT = args.port ?? 3005;
    const webServices = [];
    for (const serviceEntry of Object.entries(args.services)) {
      const service = serviceEntry[1];
      const packageName = service.packageName;
      const importPathOrName = service.servicePath;
      const webservice = await installWebService(
        packageName,
        importPathOrName,
        PORT,
        app,
        {
          appDataRoot: args.appDataRoot,
          ...service,
          ...service.serviceConfiguration,
          ...args.serviceArgs,
        },
      );
      webServices.push(webservice);
    }

    gLogger.debug(`Starting express app...`);
    await app.listen(PORT, (err) => {
      if (err) {
        gLogger.log(err);
      }
      gLogger.info(
        `${webServices
          .map((service) => {
            return service.name;
          })
          .join(",")} running on port ${PORT}`,
      );
    });
  } catch (e) {
    gLogger.error(
      `Error occurred initializing service\n ${e.message}\n ${e.stack ?? {}}`,
    );
  }
}
