#!/usr/bin/env node
// @ts-ignore
import express, { Request, Response } from '@swizzyweb/express';
import { BrowserLogger, ILogger } from '@swizzyweb/swizzy-common';
import { readFileSync } from 'fs';
// @ts-ignore
import { SwizzyDynServeFrontendWebService } from '@swizzyweb/swizzy-dyn-serve-frontend-web-service';
import path from 'path';
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
	};
}

function getPackageName(logger: ILogger) {
	try {
		const serviceName = process.argv[2];
		if (!serviceName || serviceName === '.') {
			return getServiceNameFromCurrentDirPackage(logger);
		}
		return serviceName;
	} catch(e) {
		logger.error("Web service name not found at argv[2]");
		throw new Error(`Web service name must be provided as the first argument.
						${getHelpText()}`);
	}
};

function installWebService(packageName: string, port: number, expressApp: any, logger: ILogger) { // Probably use type of express app
	try {
		logger.info(`Getting webservice package ${packageName} and will run on port ${port}`);
		const tool = require(packageName as string);
		logger.info(`Got service with require`);
		logger.debug(JSON.stringify(tool));
	
		logger.info(`Getting web service from tool...`);
		const service = tool.getWebservice({app: expressApp});
		logger.info(`Got web service`);
		logger.info(`Installing web service...`);
		service.install({});
		logger.info(`Installed web service`);
		return service;
	} catch(e) {
		const exceptionMessage = `Failed to install web service, is it installed with NPM? Check package exists in node_modules
		To add, run:
			npm install ${packageName??'packageName'}
		args:
			packageName: ${packageName}
			port: ${port}
		exception: ${e}
		${getHelpText}`;
	logger.error(`Failed to install web service`);
	throw new Error(exceptionMessage);
}
}
const gLogger = new BrowserLogger();
const PACKAGE_NAME= getPackageName(gLogger);
const PORT = parseInt(process.argv[3] ?? '3005');
const app = express();
const webservice = installWebService(PACKAGE_NAME, PORT, app, gLogger);

gLogger.info(`Starting express app...`);
app.listen(PORT, () => {
    console.info(`${webservice.name} running on port ${PORT}`);
});

