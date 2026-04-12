package com.promptgenie.config;

import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import org.apache.ibatis.session.Configuration;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.promptgenie.*.mapper")
public class MyBatisPlusConfig {
    
    @Bean
    public org.apache.ibatis.session.ConfigurationCustomizer configurationCustomizer() {
        return new org.apache.ibatis.session.ConfigurationCustomizer() {
            @Override
            public void customize(Configuration configuration) {
                // 注册类型处理器
                configuration.getTypeHandlerRegistry().register(java.util.Map.class, JacksonTypeHandler.class);
            }
        };
    }
}
