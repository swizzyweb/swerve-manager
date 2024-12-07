# swerve

swizzy-swerve is a bootstrapper for swizzy web services. This package will bootstrap and run
independent swizzy web services.

### Supported commands

swerve: synonym for swerven
swerven: swerve with nodejs
swerveb: swerve with bun
swerved: swerve with deno
swervenc: swerve with node clustered
swervebc: swerve with bun clustered
swervedc: swervice with deno clustered.

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

## run clustered

```
swervec <service> [--numThreads (optional)] [options]
```

Note: cluster commands end with c

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
