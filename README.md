# swerve
swizzy-swerve is a bootstrapper for swizzy web services. This package will bootstrap and run
independent swizzy web services.

## Usage:
npm run server <packageName> <port (optional>

## Or install globally:
npm install -g .

## Uninstall
npm uninstall -g @swizzyweb/swerve

## Command
swerve <packageNames>

Swerve can run multiple packages on the same port using a single command.
Just provide multiple package names space separated.

## run
```
swerve <service> [seriveB serivceC...] [options]
```
#### options
--port : (optional) port value to run service on

#### ie: 
```
swerve some-service-name --port=3000
```
## 
### No args
This will run the project in the current working directory
```
swerve
```

### Current dir with port
This will run the server in the current directory with the specified port
```
swerve .
```

#### with port:
```
swerve . --port 3000
```


### Run single file
```
swerve /path/to/file.js
```
#### ie:
```
swerve /absolute/path/to/app.js
```

or

```
swerve $(pwd)/dist/app.js
```

