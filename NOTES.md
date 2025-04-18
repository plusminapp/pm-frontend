## Devcontainer technologie
De gebruikte devcontainer config zorgt ervoor dat iedere ontwikkelaar dezelfde ontwikkel omgeving heeft, inclusief
vscode extensions. De inhoud van de devcontainer vind je in de devcontainer.json file.
Als je de container opspint, krijg je lokaal de remote vscode view te zien met daarin de pm-frontend repo code.
Ontwikkelen doe je met een dev server draaiend (`npm run dev`). Hiervoor moet eerst eenmaling `npm install` zijn uitgevoerd, lokaal of in de devcontainer.
Browser wordt door vscode geopend op localhost:5173
Swagger is bereikbaar op http://localhost:5173/api/v1/swagger-ui/index.html

Let op: aanpassingen worden via de vscode git tools naar github gesynced (commandline push werkt (nog) niet?)
Let op: de proxy in vite.config.ts wijst naar host.docker.internal. Daarom werkt pm-frontend voorlopig alleen 
nog in de devcontainer.

# Voorwaarden
- Gebruik lokale Vscode of installeer deze.
- Check of de Make tool bestaat (`which make`) of installeer deze.
- Installeer extension "Dev Containers" van microsoft (ms-vscode-remote.remote-containers) >= 0.409.0
- De runtime omgeving, de `lcl` componenten, moeten via de docker compose (of podman compose) opgestart zijn.
  In het pm-deploy project doe je dat op de commandline met het commando: `make lcl-all`
- Zonder de runtime omgeving wordt de applicatie gevuld met default static data
- Via nginx wordt de runtime omgeving geproxyd
- Een asguardeo login is (nu nog) nodig om met de runtime omgeving verbinding te maken.

## TL;DR
- Check de repo van pm-frontend uit (deze dus ;))
- Navigeer naar de .devcontainer folder en selecteer de devcontainer.json file.
- Open command pallet (mac fn+f1) en zoek "Dev Containers"
- Selecteer "Dev Containers: Rebuild and reopen in container"
and bob's your uncle!

Er draait nu een ontwikkelomgeving die voor elke ontwikkelaar hetzelfde is.
De postinstall_actions.sh lijst een aantal variabelen uit:

Alle oh-my-zsh shell goodies zijn available (aanvullen commandline promt, geen cd meer nodig, - en .. werken ook etc)
Daarnaast zijn ook alle default aliassen voor git geinstalleerd (vb gst, gcmsg, gbr etc) (probeer eens: alias | grep "check")

Als bonus heb je de zsh shell van "Agnoster" welke een mooie git weergave heeft. 
Nb. powerlevel10k is een aparte zsh shell feature die op verzoek kan worden toegevoegd.
