# GRADLE WORK
# JAVA17??
FROM gradle:8-jdk17-alpine AS build

COPY --chown=gradle:gradle . /home/gradle/src

WORKDIR /home/gradle/src

# RUN gradle build -x test --no-daemon 
RUN gradle build --no-daemon

# -----------------------

FROM bellsoft/liberica-openjdk-alpine:17.0.6-10

LABEL org.opencontainers.image.source="https://github.com/pr0tex/DynaNotes"

ARG CHROME_DRIVER_VER=112.0.5615.49

EXPOSE 8080

WORKDIR /app

RUN wget -q https://chromedriver.storage.googleapis.com/${CHROME_DRIVER_VER}/chromedriver_linux64.zip \
    && unzip chromedriver_linux64.zip \
    && rm chromedriver_linux64.zip

COPY --from=build /home/gradle/src/build/libs/spring-boot-application-0.0.1.jar /app/spring-boot-application.jar

COPY ./scripts/ /app/scripts/

RUN chmod +x /app/scripts/*.sh
    # && chmod +x ./gradlew
ENTRYPOINT ["java", "-jar","/app/spring-boot-application.jar"]

# ENTRYPOINT ["/app/scripts/startAndTest.sh"]