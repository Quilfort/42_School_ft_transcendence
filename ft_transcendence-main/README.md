# ft_transcendence


## Getting started
# Step 1 (IF YOU HAVE NOT CLONED THE PROJECT YET!)
Clone the project:
With SSH: 
`git@gitlab.com:revolutionary-jaw-dropping-ball-juggling-quest/ft_transcendence.git`

With HTTPS: 
`https://gitlab.com/revolutionary-jaw-dropping-ball-juggling-quest/ft_transcendence.git`


## Database
# For adding database to docker
`docker run --name postgres_db -d -p 5432:5432 -e POSTGRES_PASSWORD=trans -e POSTGRES_DB=trans -e POSTGRES_USER=trans postgres:alpine`

# For pushing database tables
`npx prisma db push`

# For seeding database tables
`npx prisma db seed`

# For running database
`npx prisma studio`

# For removing database tables (ONLY DO THIS IF YOU NEED TO REMOVE THE DATABASE TABLES!)
`npx ts-node prisma/db-reset.ts`


## Client
# For starting Svelte Client
Go to the client folder:
`cd <PLACE_WHERE_YOU_STORED_FOLDER>/ft_transcendence/client`

Install the packages:
`npm i`

Run client:
`npm run dev`


## Server
# For starting Nest Server
Go to the server folder:
`cd <PLACE_WHERE_YOU_STORED_FOLDER>>/ft_transcendence/server`

Install the packages:
`npm i`

Run server:
`npm run start`



