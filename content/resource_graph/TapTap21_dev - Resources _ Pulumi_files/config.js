
    (function() {
        var pulumiConfig = {};
        pulumiConfig.apiEndpoint = "https://api.pulumi.com/api";
        pulumiConfig.rootDomain = "pulumi.com";
        pulumiConfig.githubOAuthAppID = "7cf9078f3c92b17a5f0f";
        pulumiConfig.stripePublishableKey = "pk_live_rb2ij3MCPGaatBMdzivkvg5G";
        pulumiConfig.reCaptchaSiteKey = "6Lf7c5cUAAAAAOfMArsliLAP3JbNG6r_x8700S9m";
        pulumiConfig.loginReCaptchaSiteKey = "6LcOdJcUAAAAAIeWK_qNgv32QVeDgQ2JxKhpZE49";
        pulumiConfig.enabledSocialIdentities = ["bitbucket.org","github.com","gitlab.com"];
        pulumiConfig.samlSsoEnabled = true;
        pulumiConfig.loadStatusPageEmbed = true;
        pulumiConfig.consoleSegmentWriteKey = "mW5xGpEAoyiEtch7DbmYwBVbz47GbRKC";
        pulumiConfig.sh = false;
        pulumiConfig.hideEmailLogin = false;
        pulumiConfig.hideEmailSignup = false;

        window.pulumiConfig = pulumiConfig;
    }());
    