## installation
##### clone project
```
docker-compose build
docker-compose up -d
```

##### to run seeders:
```
docker exec -it pixel-users sh
node Database/seed/DatabaseSeeder.js
```

```
docker exec -it pixel-conversation sh
node Database/seed/DatabaseSeeder.js
```
 
##### import postman_collection  and postman_environment to test