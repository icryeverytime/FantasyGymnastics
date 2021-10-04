# FantasyGymnastics
[![CodeFactor](https://www.codefactor.io/repository/github/chriscosma/fantasygymnastics/badge)](https://www.codefactor.io/repository/github/chriscosma/fantasygymnastics)

Install node: https://nodejs.org/en/ and yarn: https://classic.yarnpkg.com/en/docs/install

## Client
`cd client`

`yarn install` (first time)

`yarn start`

## Server

### Non-Docker
`cd server`

`yarn install` (first time)

`yarn run dev`

### Docker
`cd server`

`docker build -t . someimagename`

`docker run -p 3000:3000 -d someimagename`