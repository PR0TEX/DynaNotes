package pl.edu.pg.projektGrupowy.DynaNotes.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

@Configuration
public class SwaggerConfiguration {
    public ApiInfo apiInfo() {
        return new ApiInfoBuilder()
            .title("API Dynanotes")
            .description("Dynanotes application API")
            .version("1.0.0")
            .build();
    }

    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.OAS_30)
            .apiInfo(apiInfo())
            .enable(true)
            .select()
            .paths(PathSelectors.any())
            .build();
    }
}
