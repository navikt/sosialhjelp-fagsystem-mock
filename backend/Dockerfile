FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/jre:openjdk-21
ENV TZ="Europe/Oslo"
WORKDIR /app
COPY build/libs/*-all.jar app.jar
EXPOSE 8080
CMD ["-jar", "app.jar"]
