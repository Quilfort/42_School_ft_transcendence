
if [ ! -f lock ]; then
	npx prisma migrate dev --name entrypoint --schema src/prisma/schema.prisma
	while [ $? != 0 ]
	do
		sleep 1
		npx prisma migrate dev --name entrypoint --schema src/prisma/schema.prisma
	done
	touch lock
else
	echo 'db has already been migrated'
fi

npm run start