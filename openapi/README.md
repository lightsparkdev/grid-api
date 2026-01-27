# API Design Guidelines

This readme is a continually evolving document meant to provide API design best practices for the following purposes.

1. API feels consistent
2. Preempt known bad patterns
3. Make new APIs easy to define

---
## OpenAPI schema version
We use [OpenAPI schema 3.1][(](https://spec.openapis.org/oas/v3.1.0.html)).  Do not define schema in 3.2, it will break client library generation.

## Design Considerations
- Imagine you're teaching a customer how to use our API. How might you structure the API to make it easy to explain and understand?
- Since we don't know exactly how customers will use the API, how might we make it flexible?
- Can integrators guess how your API works based on how other features work?
- When something goes wrong, can the integrator figure out why?

## Directory Structure

```
openapi/
├── openapi.yaml              # Main spec file with paths, tags, and security
├── paths/                    # Endpoint definitions organized by resource
│   ├── customers/            # Customer-related endpoints
│   ├── quotes/               # Quote-related endpoints
│   ├── transactions/         # Transaction-related endpoints
│   └── {resource}/           # Other resource endpoints
├── components/
│   └── schemas/
│       ├── common/           # Shared schemas (Address, Currency, etc.)
│       ├── customers/        # Customer schemas
│       ├── transactions/     # Transaction schemas
│       ├── errors/           # Error schemas (Error400.yaml, Error401.yaml, etc.)
│       └── {resource}/       # Other resource schemas
└── webhooks/                 # Webhook event definitions
```

### File Naming Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `{resource}.yaml` | Collection endpoints | `customers.yaml` |
| `{resource}_{pathParam}.yaml` | Single resource endpoints | `customers_{customerId}.yaml` |
| `{resource}_{pathParam}_{action}.yaml` | Action endpoints | `quotes_{quoteId}_execute.yaml` |

---

## Versioning

We version by dates but SDKs still use semver.

### Version Format
- **API Version**: `YYYY-MM-DD` format (e.g., `2025-10-13`)
- **Server URL**: Version is included in the path: `https://api.lightspark.com/grid/2025-10-13`
- **SDK Version**: Follows semver (`1.0.0`, `1.1.0`, `2.0.0`)

### What's Considered a Breaking Change
- New required field on request
- Removing a field from response
- Changing a field name
- Changing a resource name or path
- Changing the type of a field
- Removing an enum value

When you release an SDK, Stainless will flag breaking changes.

### What's Not a Breaking Change
- Making a required field optional
- Adding a new optional field
- Adding a new enum value
- Adding a new endpoint
- Adding a new response field

### Deprecation Policy
*TBD! BUT initial thoughts* 
1. Mark deprecated endpoints with `deprecated: true` in OpenAPI spec
2. Document deprecation in changelog and SDK release notes
3. Maintain deprecated endpoints for at least X months
4. Communicate migration path in documentation

### Instead of a breaking change, you can
- Add new optional fields instead of modifying existing ones
- Create a new endpoint if behavior must change significantly

---

## Naming Conventions

### Resources
- Use **plural nouns** for resource names: `/customers` not `/customer`
- Exception: Use singular when there can only be one (e.g., `/config`)

### Identifiers
ID values should be prefixed with the resource type to help users identify the resource type in their system.

| Resource | ID Format | Example |
|----------|-----------|---------|
| Customer | `Customer:{uuid}` | `Customer:019542f5-b3e7-1d02-0000-000000000001` |
| Quote | `Quote:{uuid}` | `Quote:019542f5-b3e7-1d02-0000-000000000001` |
| Transaction | `Transaction:{uuid}` | `Transaction:019542f5-b3e7-1d02-0000-000000000001` |

### Field Naming

| Element | Convention | Example |
|---------|------------|---------|
| Fields | camelCase | `platformCustomerId`, `hasMore`, `nextCursor` |
| Enums | UPPER_SNAKE_CASE | `INDIVIDUAL`, `BUSINESS`, `INVALID_INPUT` |
| Query params | camelCase | `startDate`, `sortOrder`, `customerId` |
| Path params | camelCase | `customerId`, `quoteId`, `transactionId` |

Use a type hint where it makes sense eg startDate, customerId.

### Common Fields

| Name | Description |
|------|-------------|
| `id` | Unique identifier for the resource (prefixed format) |
| `createdAt` | ISO 8601 timestamp when the resource was created |
| `updatedAt` | ISO 8601 timestamp when the resource was last updated |

---

## Service Patterns

### States

Resources with lifecycle states (e.g., transactions, quotes, invitations) should document:
1. All possible states
2. Valid state transitions
3. What triggers each transition
4. Which states are terminal (no further transitions)

#### State Naming Conventions

- Use UPPER_SNAKE_CASE for state values
- Use past tense for terminal states: `COMPLETED`, `FAILED`, `CANCELLED`
- Use present continuous for in-progress states: `PENDING`, `PROCESSING`
- Use `CREATED` for initial states (not `NEW`)

#### Documenting State Machines

Include a [Mermaid State Diagram](https://mermaid.js.org/syntax/stateDiagram.html) in the schema description to visualize transitions:

```yaml
status:
  type: string
  enum:
    - CREATED
    - PENDING
    - PROCESSING
    - COMPLETED
    - FAILED
    - EXPIRED
  description: |
    Current status of the transaction.

    ```mermaid
    stateDiagram-v2
      [*] --> CREATED
      CREATED --> PENDING: Quote executed
      PENDING --> PROCESSING: Payment initiated
      PROCESSING --> COMPLETED: Payment successful
      PROCESSING --> FAILED: Payment failed
      CREATED --> EXPIRED: Quote expired
      PENDING --> EXPIRED: Timeout
    ```

    | Status | Description | Terminal |
    |--------|-------------|----------|
    | CREATED | Transaction created, awaiting execution | No |
    | PENDING | Awaiting payment or confirmation | No |
    | PROCESSING | Payment in progress | No |
    | COMPLETED | Payment successful | Yes |
    | FAILED | Payment failed | Yes |
    | EXPIRED | Quote or transaction expired | Yes |
```

#### Terminal vs Non-Terminal States

- **Terminal states**: No further transitions possible. Mark these clearly in documentation.
- **Non-terminal states**: Can transition to other states. Document what triggers each transition.

#### Example: Transaction Status

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> PENDING: execute quote
    CREATED --> EXPIRED: quote expires
    PENDING --> PROCESSING: payment initiated
    PENDING --> EXPIRED: timeout
    PROCESSING --> COMPLETED: success
    PROCESSING --> FAILED: error
    PROCESSING --> REJECTED: compliance rejection
    COMPLETED --> REFUNDED: refund issued
```

#### Example: Quote Status

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSING: execute called
    PENDING --> EXPIRED: TTL exceeded
    PROCESSING --> COMPLETED: transaction created
    PROCESSING --> FAILED: execution error
```

### Resource Actions

When enabling an action on a resource, use `POST /{resource}/{id}/{action}`:

```
POST /quotes/{quoteId}/execute
POST /invitations/{invitationCode}/claim
POST /invitations/{invitationCode}/cancel
POST /transactions/{transactionId}/approve
POST /transactions/{transactionId}/reject
```

### Linked Resources vs Sub-Resources

Prefer flat, linked resources over deeply nested sub-resources:

```
# Preferred: Flat with query parameter
GET /external-accounts?customerId={customerId}

# Avoid: Sub-resourcing 
GET /customers/{customerId}/external-accounts
```

If an integrator wanted to get all external accounts, they would need to make one request for each customerId.

### Filtering

- Use query parameters for filtering: `?status=PENDING&customerId=Customer:123`
- Support duplicated values for multifilter: `?customerId={id_1}&customerId={id_2}`
- Use ISO 8601 for date filters: `?startDate=2025-01-01T00:00:00Z`

### Sorting

- Use `sortOrder` parameter with values `asc` or `desc`
- Default to `desc` (most recent first) for time-based resources

---

## OpenAPI Best Practices

### Discriminators and Polymorphism

OneOfs must include a discriminator:

```yaml
oneOf:
  - $ref: '#/components/schemas/IndividualCustomer'
  - $ref: '#/components/schemas/BusinessCustomer'
discriminator:
  propertyName: customerType
  mapping:
    INDIVIDUAL: '#/components/schemas/IndividualCustomer'
    BUSINESS: '#/components/schemas/BusinessCustomer'
```

Also:
- Define the discriminator property as a separate schema with an enum so generated client libraries include an enum class (see `openapi/components/schemas/customers/CustomerType.yaml`, used by `customerType` in `Customer` and `CustomerCreateRequest`).
- Each discriminated schema must include the discriminator field with a single-value enum, because the OpenAPI generator does not reliably infer it from the discriminator (see `IndividualCustomerFields` included by `IndividualCustomer.yaml` and `IndividualCustomerCreateRequest.yaml`, where `customerType` is `enum: [INDIVIDUAL]`).

### Composition

- Use `allOf` for extending base schemas

### Documentation in OpenAPI

- Add `description` to every endpoint, parameter, and schema field
- Include realistic `example` values that can be copied
- Use markdown tables in descriptions to document enum values:

```yaml
code:
  type: string
  description: |
    | Error Code | Description |
    |------------|-------------|
    | UNAUTHORIZED | Issue with API credentials |
    | INVALID_SIGNATURE | Signature header is invalid |
  enum:
    - UNAUTHORIZED
    - INVALID_SIGNATURE
```

### Validation

- Use `minimum`, `maximum` for numeric bounds
- Use `format` for standard types: `date-time`, `email`, `uri`, `uuid`
- Use `enum` for fixed value sets
- Use `pattern` for regex validation when needed

---

## HTTP Methods and Status Codes

### HTTP Methods

| Method | Usage | Success Code |
|--------|-------|--------------|
| GET | Retrieve resource(s) | 200 |
| POST | Create resource or execute action | 201 (create), 200 (action) |
| PATCH | Partial update of a resource | 200 |
| DELETE | Remove a resource | 204 |

### Success Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PATCH, or action POST |
| 201 | Resource created successfully |
| 204 | Resource deleted successfully (no content) |

### Error Status Codes
Generally 4xx errors indicate an issue with the integrators request and 5xx errors indicate an issue with our services.  Our client libraries will automatically retry 5xx responses.

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists, state conflict |
| 412 | Precondition Failed | Conditional request failed |
| 424 | Failed Dependency | Dependent service failure |
| 500 | Internal Server Error | Unexpected server error |
| 501 | Not Implemented | Feature not yet available |

---

## Pagination

We use cursor-based pagination for all list endpoints. This pattern is compatible with Stainless SDK auto-pagination.

### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Maximum results to return (max: 100) |
| `cursor` | string | - | Opaque cursor from previous response |

### Response Structure

```json
{
  "data": [...],
  "hasMore": true,
  "nextCursor": "eyJpZCI6IjEyMzQ1In0=",
  "totalCount": 150
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of resources |
| `hasMore` | boolean | Whether more results exist |
| `nextCursor` | string | Cursor for next page (only if `hasMore: true`) |
| `totalCount` | integer | Total matching resources (excluding pagination) |

---

## Error Handling

### Error Schema Organization

Error codes across services are aggregated by HTTP status code in `components/schemas/errors/`.  As an example both `/customers` and `/transactions` may have unique 400 error codes.  All of these would be aggregated in the `Error400.yaml` definition.  Stainless then uses these to generate [unique throwable errors](https://github.com/lightsparkdev/umaaas-kotlin-sdk/blob/main/umaaas-kotlin-core/src/main/kotlin/com/lightspark/umaaas/errors/SpecificApiErrors.kt) 

| File | HTTP Status | Example Codes |
|------|-------------|---------------|
| `Error400.yaml` | 400 Bad Request | `INVALID_INPUT`, `INVALID_AMOUNT`, `MISSING_MANDATORY_USER_INFO` |
| `Error401.yaml` | 401 Unauthorized | `UNAUTHORIZED`, `INVALID_SIGNATURE` |
| `Error403.yaml` | 403 Forbidden | `FORBIDDEN`, `INSUFFICIENT_PERMISSIONS` |
| `Error404.yaml` | 404 Not Found | `NOT_FOUND`, `CUSTOMER_NOT_FOUND` |
| `Error409.yaml` | 409 Conflict | `CONFLICT`, `ALREADY_EXISTS` |
| `Error500.yaml` | 500 Internal Error | `INTERNAL_ERROR` |

### Error Response Structure

All errors follow a consistent structure:

```json
{
  "status": 400,
  "code": "INVALID_INPUT",
  "message": "The provided email address is not valid",
  "details": {
    "field": "email",
    "reason": "Invalid format"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | integer | Yes | HTTP status code |
| `code` | string | Yes | Machine-readable error code (SCREAMING_SNAKE_CASE) |
| `message` | string | Yes | Human-readable error message |
| `details` | object | No | Additional context about the error |

### Error Code Guidelines

- Use SCREAMING_SNAKE_CASE for error codes
- Make codes specific and actionable (e.g., `INVALID_BANK_ACCOUNT` not just `INVALID`)
- Document all codes with descriptions in the Error schema
- Include markdown tables in the `description` field listing all codes

### Adding New Error Codes

1. Identify the appropriate HTTP status code
2. Add the new code to the corresponding `Error{StatusCode}.yaml` enum
3. Add a description in the markdown table within the `code` field description
4. Update SDK error handling if needed

---

## Stainless SDK Patterns

Our SDKs are generated by [Stainless](https://www.stainless.com/) from the OpenAPI spec.

### SDK Usage Example

```typescript
import Grid from 'grid';

const client = new Grid({
  username: process.env['GRID_USERNAME'],
  password: process.env['GRID_PASSWORD'],
});

// Auto-pagination
for await (const customer of client.customers.list()) {
  console.log(customer.id);
}

// Error handling
try {
  await client.quotes.execute('Quote:invalid');
} catch (err) {
  if (err instanceof Grid.NotFoundError) {
    console.log('Quote not found');
  }
}
```
Stainless also generates [API reference SDK examples](https://www.stainless.com/docs/guides/integrate-docs#how-stainless-generates-sdk-code-snippets) for our Mintlify documentation

---

## Redocly CLI

We use Redocly CLI to bundle and lint the OpenAPI schema.

### Bundling

```bash
npx @redocly/cli bundle openapi/openapi.yaml -o openapi.yaml
```

### Useful Features

- [Hide APIs for internal use](https://redocly.com/docs/cli/guides/hide-apis)
- Lint rules configured in `.redocly.yaml`
- Ignore specific lint rules in `.redocly.lint-ignore.yaml`
