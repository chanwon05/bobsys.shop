FROM node:24-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:21-jdk-jammy AS backend
WORKDIR /build/backend
COPY backend/ ./
COPY --from=frontend /build/frontend/dist/ ./src/main/resources/static/
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew --no-daemon test bootJar
RUN find build/libs -name '*.jar' ! -name '*-plain.jar' -exec cp {} /build/app.jar \;

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=backend /build/app.jar ./app.jar
ENV SPRING_PROFILES_ACTIVE=railway
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
