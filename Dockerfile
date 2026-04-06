# 构建阶段
FROM maven:3.8.6-openjdk-11 AS build
WORKDIR /app
COPY pom.xml .
COPY backend/pom.xml backend/
COPY backend/src backend/src
RUN mvn -f backend/pom.xml clean package -DskipTests

# 运行阶段
FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/backend/target/prompt-genie-backend.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "prompt-genie-backend.jar"]