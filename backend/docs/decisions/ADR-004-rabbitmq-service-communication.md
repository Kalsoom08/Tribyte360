# ADR-004: RabbitMQ Microservices Event Bus

## Status
Accepted

## Context
Direct HTTP coupling between services introduces tight coupling and cascade failures.

## Decision
Use RabbitMQ message patterns for asynchronous and RPC-style command execution between the API Gateway and backend domain services.
