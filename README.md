# Superb Site Reliability Engineering Challenge

A fun and practical test for the SRE position at Superb.

## Introduction

Superb is growing. Today we have 4 applications organized in a [monorepo](https://en.wikipedia.org/wiki/Monorepo). They are:

- **[auth](./auth/)**: An HTTP API used to register and authenticate users that will use our platform. This is a high audience service and must have attention with it.
- **[booking](./booking/)**: A gRPC API responsible by manage restaurant bookings.
- **[graphql](./graphql/)**: This API is our border service. It make the bridge between frontend applications and our microservices.
- **[client](./client/)**: This API is a frontend app used to manage bookings.

## Infrastructure design

The infrastructure is mainly deployed in AWS, with some GitHub resources and Dockerhub repositories.

# Pulumi

All the AWS resources in this project is provisioned and declaratively implemented in the `infra` directory using [Pulumi](https://pulumi.com). Pulumi is an infrastructure as code (IaC) tool that uses an SDK based approach to infrastructure.

For this application the Pulumi code was kept as simple as possible to demonstrate idea of the design, thus it does not contain a complex file structure as would be advised by [Pulumi best practice](https://www.pulumi.com/docs/guides/)

The resource graph for all the resources created and managed by Pulumi can be viewer [here](content/resource_graph/pulumi-final.html)
## Goals

As a developer, I know the best practices to build a good product, but I don't know what is the best way to deliver the applications I've coded.

So, what we expect of you is:

### Infrastructure side

- A picture of the whole architecture you plan to setup. This picture must cover all aspects of the infrastructure: Networking, Storage, Hosts. Feel free to use any tool you like.
- The code to provision all resources you planned in the last step. Feel free to use any tool of your preference: terraform, ansible, puppet, cloudformation, etc.

### Application side

- A picture of all services and how they communicate one each other. 
- The schema plan of all resources you've drawn in the last step. If you use helm or any automatic solution to provision resources, don't forget to export them in an yaml or any other readable format.
- We also expect a delivery pipeline solution. Feel free to use a tool of your preference. We are using github as VCS, btw.

### Additional information

All API's are developed for this challenge and may or may not work as expected. You don't need to fix them. You will be assessed by the infrastructure design, cloud provider and application management.

BTW, currently we are using AWS as cloud provider. 
