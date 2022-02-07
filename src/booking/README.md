# Booking API

An gRPC API to manage restaurant bookings

## Requirements

- node: >= 14.x

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
cd booking
npm install
export MONGODB_URL=mongodb://superb:superb@localhost/superb
npm start
```

THe api will be available at:

```
http://localhost:3000
```
