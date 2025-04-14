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

```

--port : (default 3005) port value to run service
--appDataRoot - (default project root) path to where appdata root directory will be placed, stores logs and service data
--numThreads - (default num cpu's reported by os) (cluster only) number of threads to use in the cluster

```

```

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

## Additional runtimes

We support bun deno and nodejs for runtimes

```

swerven # node
swerveb # bun
swerved # deno

swerven # default (points to swerven as of 0.2.4)

```

## cluster

to run a cluster of your swerve services, you can use the cluster scripts. These are implemented in nodejs, bun, and deno.

### default cluster

```

swervec

```

### nodejs cluster

```

swerven

```

### bun cluster

```

swervebc

```

### deno

```

servedc

```

```

```

```
