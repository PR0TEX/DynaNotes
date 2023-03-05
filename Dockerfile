FROM openjdk:20-ea-17-oracle as build
LABEL org.opencontainers.image.source="https://github.com/pr0tex/DynaNotes"

ARG JAR_FILE=build/libs/DynaNotes-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} DynaNotes.jar

ENTRYPOINT ["java","-jar","DynaNotes.jar"]
EXPOSE 8080
