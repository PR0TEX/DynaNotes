FROM gradle:8-jdk17-alpine AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build -x test --no-daemon 


FROM bellsoft/liberica-openjdk-alpine:17.0.6-10
LABEL org.opencontainers.image.source="https://github.com/pr0tex/DynaNotes"

EXPOSE 8080

RUN mkdir /app

COPY --from=build /home/gradle/src/build/libs/spring-boot-application-0.0.1.jar /app/spring-boot-application.jar

ENTRYPOINT ["java", "-jar","/app/spring-boot-application.jar"]