# GraphQL API

An HTTP API that serves a graphql interface.

## Requirements

- node: >= 14.x

## Get Started

Clone this repository:

```
git clone git@github.com:superbexperience/codechallenge-sre.git
cd codechallenge-sre
```

Start side applications:

```
docker-compose up -d booking auth
```

Go to this directory and launch the app:

```
cd graphql
npm install
export AUTH_SERVICE_URI=http://localhost:4000
export BOOKING_SERVICE_URI=localhost:4100
npm start
```

Access the webconsole:

```
http://localhost:3000/graphql
```
