# ft_transcendence


## Getting started
# First steps
# Step 1
Clone the project:
With SSH: 
`git@gitlab.com:revolutionary-jaw-dropping-ball-juggling-quest/ft_transcendence.git`

With HTTPS: 
`https://gitlab.com/revolutionary-jaw-dropping-ball-juggling-quest/ft_transcendence.git`

# Step 2
Go to the client & server folder
For the Client: 
`cd <PLACE_WHERE_YOU_STORED_FOLDER>/ft_transcendence/client`

For the Server: 
`cd <PLACE_WHERE_YOU_STORED_FOLDER>>/ft_transcendence/server`

# Install packages
`npm i`

# For starting Svelte Client
`npm run dev`

# For starting Nest Server
`npm run start`

# For starting prisma database
`docker run --name postgres_db -d -p 5432:5432 -e POSTGRES_PASSWORD=trans -e POSTGRES_DB=trans -e POSTGRES_USER=trans postgres:alpine`

# For pushing database tables
`npx prisma db push`

# For seeding database tables
`npx prisma db seed`

# For removing database tables
`npx ts-node prisma/db-reset.ts`


