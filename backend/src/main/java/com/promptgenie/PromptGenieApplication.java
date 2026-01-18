package com.promptgenie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.cache.annotation.EnableCaching;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@EnableAsync
@EnableCaching
@MapperScan("com.promptgenie.mapper")
public class PromptGenieApplication {

    public static void main(String[] args) {
        SpringApplication.run(PromptGenieApplication.class, args);
    }

}
