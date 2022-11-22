FROM onfinality/subql-node:latest
WORKDIR /app
COPY . .
RUN  yarn install && yarn codegen && yarn build
Entrypoint  ["/sbin/tini","--","/usr/local/lib/node_modules/@subql/node/bin/run"]
