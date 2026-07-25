# Authentication for AI Agents (auth.md)

This document describes how AI agents and third-party systems can register and authenticate with the MZ API.

## Registration
To access protected MZ endpoints, agents must first register.
- **Registration Endpoint:** `https://mzltd.tech/oauth/register`
- **Supported Identity Types:** `did:web`, `x509`
- **Supported Credential Types:** `jwt_vc`

## Usage
Once registered, agents can use the Client Credentials grant or JWT Profile for OAuth 2.0 Client Authentication (RFC 7523).
- **Token Endpoint:** `https://mzltd.tech/oauth/token`

## Revocation
To revoke access:
- **Revocation Endpoint:** `https://mzltd.tech/oauth/revoke`
