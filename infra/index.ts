import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import {FileAsset} from "@pulumi/pulumi/asset";
import * as cluster from "cluster";

const defaultDefaultVpc = new aws.ec2.DefaultVpc("default", {
    tags: {
        Name: "Default VPC",
    },
});

const subnetPublic1a = new aws.ec2.Subnet(
    "subnet-public-1a",
    {
        assignIpv6AddressOnCreation: false,
        availabilityZone: "eu-west-1a",
        cidrBlock: "172.31.48.0/20",
        mapPublicIpOnLaunch: true,
        vpcId: defaultDefaultVpc.id,
        tags: {
            "Name": "my-cluster/subnet-public-1a",
            "Environment": "Production",
            "kubernetes.io/role/elb": "1",
            "kubernetes.io/cluster/my-cluster": "shared",
        },

    }
)

const subnetPublic1b = new aws.ec2.Subnet(
    "subnet-public-1b",
    {
        assignIpv6AddressOnCreation: false,
        availabilityZone: "eu-west-1b",
        cidrBlock: "172.31.64.0/20",
        mapPublicIpOnLaunch: true,
        vpcId: defaultDefaultVpc.id,
        tags: {
            "Name": "my-cluster/subnet-public-1b",
            "Environment": "Production",
            "kubernetes.io/role/elb": "1",
            "kubernetes.io/cluster/my-cluster": "shared",
        },

    }
)

const subnetPrivate1c = new aws.ec2.Subnet(
    "subnet-private-1c",
    {
        assignIpv6AddressOnCreation: false,
        availabilityZone: "eu-west-1c",
        cidrBlock: "172.31.80.0/20",
        mapPublicIpOnLaunch: true,
        vpcId: defaultDefaultVpc.id,
        tags: {
            "Name": "vcomp-devops/subnet-private-1c",
            "Environment": "Production",
            "kubernetes.io/role/internal-elb": "1",
            "kubernetes.io/cluster/my-cluster": "shared",
        },

    }
)


const mycluster = new eks.Cluster("my-cluster", {
    instanceType: "t3a.small",
    name: "my-cluster",
    desiredCapacity: 4,
    minSize: 2,
    maxSize: 4,
    subnetIds: [
        subnetPublic1a.id,
        subnetPublic1b.id,
        // subnetPrivate1c.id
    ],
    vpcId: defaultDefaultVpc.id
});

const ingressControllerPolicy = new aws.iam.Policy(
    "ingressController-iam-policy",
    {
        policy: {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "iam:CreateServiceLinkedRole"
                    ],
                    "Resource": "*",
                    "Condition": {
                        "StringEquals": {
                            "iam:AWSServiceName": "elasticloadbalancing.amazonaws.com"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:DescribeAccountAttributes",
                        "ec2:DescribeAddresses",
                        "ec2:DescribeAvailabilityZones",
                        "ec2:DescribeInternetGateways",
                        "ec2:DescribeVpcs",
                        "ec2:DescribeVpcPeeringConnections",
                        "ec2:DescribeSubnets",
                        "ec2:DescribeSecurityGroups",
                        "ec2:DescribeInstances",
                        "ec2:DescribeNetworkInterfaces",
                        "ec2:DescribeTags",
                        "ec2:GetCoipPoolUsage",
                        "ec2:DescribeCoipPools",
                        "elasticloadbalancing:DescribeLoadBalancers",
                        "elasticloadbalancing:DescribeLoadBalancerAttributes",
                        "elasticloadbalancing:DescribeListeners",
                        "elasticloadbalancing:DescribeListenerCertificates",
                        "elasticloadbalancing:DescribeSSLPolicies",
                        "elasticloadbalancing:DescribeRules",
                        "elasticloadbalancing:DescribeTargetGroups",
                        "elasticloadbalancing:DescribeTargetGroupAttributes",
                        "elasticloadbalancing:DescribeTargetHealth",
                        "elasticloadbalancing:DescribeTags"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "cognito-idp:DescribeUserPoolClient",
                        "acm:ListCertificates",
                        "acm:DescribeCertificate",
                        "iam:ListServerCertificates",
                        "iam:GetServerCertificate",
                        "waf-regional:GetWebACL",
                        "waf-regional:GetWebACLForResource",
                        "waf-regional:AssociateWebACL",
                        "waf-regional:DisassociateWebACL",
                        "wafv2:GetWebACL",
                        "wafv2:GetWebACLForResource",
                        "wafv2:AssociateWebACL",
                        "wafv2:DisassociateWebACL",
                        "shield:GetSubscriptionState",
                        "shield:DescribeProtection",
                        "shield:CreateProtection",
                        "shield:DeleteProtection"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:AuthorizeSecurityGroupIngress",
                        "ec2:RevokeSecurityGroupIngress"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:CreateSecurityGroup"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:CreateTags"
                    ],
                    "Resource": "arn:aws:ec2:*:*:security-group/*",
                    "Condition": {
                        "StringEquals": {
                            "ec2:CreateAction": "CreateSecurityGroup"
                        },
                        "Null": {
                            "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:CreateTags",
                        "ec2:DeleteTags"
                    ],
                    "Resource": "arn:aws:ec2:*:*:security-group/*",
                    "Condition": {
                        "Null": {
                            "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                            "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:AuthorizeSecurityGroupIngress",
                        "ec2:RevokeSecurityGroupIngress",
                        "ec2:DeleteSecurityGroup"
                    ],
                    "Resource": "*",
                    "Condition": {
                        "Null": {
                            "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:CreateLoadBalancer",
                        "elasticloadbalancing:CreateTargetGroup"
                    ],
                    "Resource": "*",
                    "Condition": {
                        "Null": {
                            "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:CreateListener",
                        "elasticloadbalancing:DeleteListener",
                        "elasticloadbalancing:CreateRule",
                        "elasticloadbalancing:DeleteRule"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:AddTags",
                        "elasticloadbalancing:RemoveTags"
                    ],
                    "Resource": [
                        "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
                        "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
                        "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
                    ],
                    "Condition": {
                        "Null": {
                            "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                            "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:AddTags",
                        "elasticloadbalancing:RemoveTags"
                    ],
                    "Resource": [
                        "arn:aws:elasticloadbalancing:*:*:listener/net/*/*/*",
                        "arn:aws:elasticloadbalancing:*:*:listener/app/*/*/*",
                        "arn:aws:elasticloadbalancing:*:*:listener-rule/net/*/*/*",
                        "arn:aws:elasticloadbalancing:*:*:listener-rule/app/*/*/*"
                    ]
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:ModifyLoadBalancerAttributes",
                        "elasticloadbalancing:SetIpAddressType",
                        "elasticloadbalancing:SetSecurityGroups",
                        "elasticloadbalancing:SetSubnets",
                        "elasticloadbalancing:DeleteLoadBalancer",
                        "elasticloadbalancing:ModifyTargetGroup",
                        "elasticloadbalancing:ModifyTargetGroupAttributes",
                        "elasticloadbalancing:DeleteTargetGroup"
                    ],
                    "Resource": "*",
                    "Condition": {
                        "Null": {
                            "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:RegisterTargets",
                        "elasticloadbalancing:DeregisterTargets"
                    ],
                    "Resource": "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "elasticloadbalancing:SetWebAcl",
                        "elasticloadbalancing:ModifyListener",
                        "elasticloadbalancing:AddListenerCertificates",
                        "elasticloadbalancing:RemoveListenerCertificates",
                        "elasticloadbalancing:ModifyRule"
                    ],
                    "Resource": "*"
                }
            ]
        }

    }
)


export const clusterNodeInstanceRoleName = mycluster.instanceRoles.apply(
    roles => roles[0].name
);

// Attach this policy to the NodeInstanceRole of the worker nodes.
export const nodeinstanceRole = new aws.iam.RolePolicyAttachment(
    "eks-NodeInstanceRole-policy-attach",
    {
        policyArn: ingressControllerPolicy.arn,
        role: clusterNodeInstanceRoleName
    }
);

// const t = new aws.eks

const albNamespace = new k8s.core.v1.Namespace("alb-controller", {
    metadata: {
        namespace: "alb-controller",
        name: "alb-controller"
    }
}, {provider: mycluster.provider})


// Declare the ALBIngressController in 1 step with the Helm Chart.
const albingresscntlr = new k8s.helm.v3.Chart(
    "alb",
    {
        chart:
            "aws-load-balancer-controller",
        version: "1.2.0",
        fetchOpts: {
            repo: "https://aws.github.io/eks-charts"
        },
        namespace: albNamespace.metadata.name,
        values: {
            clusterName: mycluster.eksCluster.name,
            autoDiscoverAwsRegion: "true",
            autoDiscoverAwsVpcID: "true",
        }

    },
    {provider: mycluster.provider}
);


export const kubeconfig = mycluster.kubeconfig;

const cert = new aws.acm.Certificate("cert", {
    domainName: "*.wernichbekker.com",
    tags: {
        Environment: "test",
    },
    validationMethod: "DNS",
});


const kubeProxyAddon = new aws.eks.Addon(
    "kube_proxy_addon",
    {
        addonName:"kube-proxy",
        clusterName: mycluster.eksCluster.name
    }
)

// s3_policy = aws.iam.get_policy_document(
//     statements=[
//         GetPolicyDocumentStatementArgs(
//             actions=["s3:GetObject"],
//             resources=[f"arn:aws:s3:::{app_dev_bucket_name}/*"],
//             principals=[
//                 GetPolicyDocumentStatementPrincipalArgs(
//                     type="AWS",
//                     identifiers=[dev_oai.iam_arn],
//                 )
//             ],
//         )
//     ]
// )
//
// bucket_policy = BucketPolicy(
//     "oai_bucket", bucket=app_dev_vcomp.id, policy=s3_policy.json
// )


const s3Oia = new aws.cloudfront.OriginAccessIdentity("Dev OAI", {
    comment: "Dev cloudfront OAI"
})

const bucket = new aws.s3.Bucket("bucket", {
    bucket: "frontend.wernichbekker.com",
    acl: "private",
    tags: {
        Name: "My bucket",
    },
});

const s3Policy = aws.iam.getPolicyDocumentOutput({
    statements: [{
        actions:["s3:GetObject"],
        resources:[`arn:aws:s3:::frontend.wernichbekker.com/*`],
        principals:[
            {
                type:"AWS",
                identifiers:[s3Oia.iamArn]
            }
        ]
    }]
})

const bucketPolicy = new aws.s3.BucketPolicy(
    "oai_bucket",
    {
        bucket:bucket.id,
        policy: s3Policy.apply(s3Policy => s3Policy.json)
    }
)

const s3OriginId = "myS3Origin";

const usAwsProvider = new aws.Provider("aws-pulumi-provider-us-east-1", {
    region: "us-east-1"
})

const usEastCert = new aws.acm.Certificate("us-cert", {
    domainName: "*.wernichbekker.com",
    tags: {
        Environment: "test",
    },
    validationMethod: "DNS",
}, {
    provider: usAwsProvider
});

const s3Distribution = new aws.cloudfront.Distribution("s3Distribution", {
    origins: [{
        domainName: bucket.bucketRegionalDomainName,
        originId: s3OriginId,
        s3OriginConfig: {
            originAccessIdentity: s3Oia.cloudfrontAccessIdentityPath,
        },
    }],
    enabled: true,
    isIpv6Enabled: true,
    comment: "frontend.wernichbekker.com",
    defaultRootObject: "index.html",
    // loggingConfig: {
    //     includeCookies: false,
    //     bucket: "mylogs.s3.amazonaws.com",
    //     prefix: "myprefix",
    // },
    aliases: [
        "frontend.wernichbekker.com",
    ],
    defaultCacheBehavior: {
        allowedMethods: [
            "DELETE",
            "GET",
            "HEAD",
            "OPTIONS",
            "PATCH",
            "POST",
            "PUT",
        ],
        cachedMethods: [
            "GET",
            "HEAD",
        ],
        targetOriginId: s3OriginId,
        forwardedValues: {
            queryString: false,
            cookies: {
                forward: "none",
            },
        },
        viewerProtocolPolicy: "allow-all",
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    orderedCacheBehaviors: [
        {
            pathPattern: "/content/immutable/*",
            allowedMethods: [
                "GET",
                "HEAD",
                "OPTIONS",
            ],
            cachedMethods: [
                "GET",
                "HEAD",
                "OPTIONS",
            ],
            targetOriginId: s3OriginId,
            forwardedValues: {
                queryString: false,
                headers: ["Origin"],
                cookies: {
                    forward: "none",
                },
            },
            minTtl: 0,
            defaultTtl: 86400,
            maxTtl: 31536000,
            compress: true,
            viewerProtocolPolicy: "redirect-to-https",
        },
        {
            pathPattern: "/content/*",
            allowedMethods: [
                "GET",
                "HEAD",
                "OPTIONS",
            ],
            cachedMethods: [
                "GET",
                "HEAD",
            ],
            targetOriginId: s3OriginId,
            forwardedValues: {
                queryString: false,
                cookies: {
                    forward: "none",
                },
            },
            minTtl: 0,
            defaultTtl: 3600,
            maxTtl: 86400,
            compress: true,
            viewerProtocolPolicy: "redirect-to-https",
        },
    ],
    priceClass: "PriceClass_200",
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    tags: {
        Environment: "production",
    },
    viewerCertificate: {
        acmCertificateArn: usEastCert.arn,
        sslSupportMethod:"sni-only",
    },
});

