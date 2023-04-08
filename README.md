# DynaNotes
[![Known Vulnerabilities](https://snyk.io/test/github/pr0tex/dynanotes/badge.svg)](https://snyk.io/test/github/pr0tex/dynanotes)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)
## GROUP PROJECT AT GUT

### APP v1


### What you will need
To run application on your machine, you will need Docker container management toolkit, Java 17 and Node.js

### How to start application
To run entire application with docker, run the following commands in the main directory:
./gradlew build
docker-compose up

To run java application without Docker container run the following command in the main directory:
./gradlew build && java -jar build/libs/DynaNotes-0.0.1-SNAPSHOT.jar

To run react application without Docker run the following commands in src/main/webApp directory:
npm install
npm start
