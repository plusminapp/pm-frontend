# pm-frontend (react)

De pm-frontend repo bevat de React sourcecode.

## Randvoorwaarden

- VS Code
- Docker Desktop of Rancher Desktop

## Start pm-backend incl database

`git clone` de code repositories:

- plusminapp/pm-backend
- plusminapp/pm-database
- plusminapp/pm-deploy

```bash
# bouw en run pm containers
# cd pm-deploy

make lcl-all
```

## Start Dev Container (optioneel)

- Install Dev Container plugin in VSCode
- Linker menubalk -> Remote Explorer - pm-frontend -> Open in current window.

## Start vite server

```bash
npm install
npm run dev
```

PM frontend: http://localhost:5173 Log in met je Asgardeo credentials.

Swagger: http://localhost:5173/api/v1/swagger-ui/index.html

## Dev Container opzet - meer details

De pm-frontend ontwikkelomgeving maakt gebruik van devcontainer technologie.
Devcontainers is een open spec welke in de eerste plaats het probleem van - works on my machine - oplost.
Aangezien Vscode erg ver is op het gebied van ondersteuning voor devcontainers, wordt voor de pm-frontend
de combinatie van vscode en devcontainers toegepast.

Hoe dat werkt lees je in [notes](NOTES.md)

Algemene vscode devcontainer info zie https://code.visualstudio.com/docs/devcontainers/containers.
