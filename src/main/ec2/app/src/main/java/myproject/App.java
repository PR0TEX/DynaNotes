package myproject;

import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.aws.ec2.*;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var latestAMI = Ec2Functons
                                .getAmi(
                                    GetAmiArgs.builder()
                                    .mostRecent(true)
                                    .owners("")
                                )
            ctx.export("exampleOutput", Output.of("example"));
        });
    }
}
