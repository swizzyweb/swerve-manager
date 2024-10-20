# swizzy-dyn-serve-bootstrap

## Usage:
npm run server <packageName> <port (optional>

## Or install globally:
npm install -g .

## Uninstall
npm uninstall -g @swizzyweb/swizzy-dyn-serve-bootstrap

## Command
swerve <packageName> <port (optional)>

## run

### with service and port
```
swerve <service> <port>
```

#### ie: 
```
swerve some-service-name 3000
```

### No args
This will run the project in the current working directory
```
swerve
```

### Current dir with port
This will run the server in the current directory with the specified port
```
swerve . <port>
```

#### ie:
```
swerve . 3000
```
