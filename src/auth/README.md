# Auth API

An HTTP API to authenticate restaurant users

## Requirements

- node: >= 14.x
- node-gyp

## Get Started

Clone this repository:

```
git clone git@github.com:superbexperience/codechallenge-sre.git
cd codechallenge-sre
```

Start mongodb:

```
docker-compose up -d mongodb
```

Go to this directory and launch the app:

```
cd auth
npm install
export MONGODB_URL=mongodb://superb:superb@localhost/superb
npm start
```

THe api will be available at:

```
http://localhost:3000
```
