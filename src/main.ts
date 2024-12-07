// @ts-ignore
import express, { Request, Response } from "@swizzyweb/express";
import { BrowserLogger, ILogger } from "@swizzyweb/swizzy-common";
import { readFileSync } from "fs";
import path from "path";
import { getArgs, installWebService } from "./utils";

export async function run() {
  const gLogger = new BrowserLogger();
  //const PACKAGE_NAME= getPackageName(gLogger);
  //const PORT = parseInt(process.argv[3] ?? '3005');
  const app = express();

  const args = getArgs(gLogger);
  gLogger.info(`${JSON.stringify(args)}`);
  const PORT = args.serviceArgs.port ?? 3005;
  const webServices = [];
  for (const serviceName of args.serviceNames) {
    const webservice = await installWebService(
      serviceName,
      PORT,
      app,
      gLogger,
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
