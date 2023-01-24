# Types
## Interfaces

An interface symbol name should start with letter "I".

For Entity interfaces, the names should be like "IProblemBaseEntity", "IProblemEntity", "IProblemExtra"

IProblemEntity should extend IProblemBaseEntity, and we also need to define 2 types, "IProblemBaseEntityWithExtra" and "IProblemEntityWithExtra".

The base entity interface just includes their self properties that needed in list item, and the entity interface should includes all of their self properties.

For extra properties, they should be calculated from other entities, but also need to be sent to the client side.

## TypeORM Entity Class

An entity class symbol name should be like "ProblemEntity".

The entity classes should implement the entity interface, and should not includes extra properties.

Adding more properties outside the interfaces is allowed.

## DTO Class

A request/response DTO class symbol name should like
```
[Get, Post, Patch, Delete]?<name>[Request[Param, Query, Body], Response]Dto
```
Such as "GetProblemListRequestQueryDto", "ProblemDetailRequestParam", "PatchProblemDetailRequestBodyDto".

A data DTO class symbol name should like
```
<name>(Base)?DetailDto
```

Such as "ProblemBaseDetailDto", "ProblemDetailDto".

List item DTO class should extend base entity interfaces (with extra).

Detail DTO class should extend entity interfaces (with extra).

Post and patch request body should use type HttpPatch<T> with entity interfaces without extra.

Request param and query DTO class's properties validation must using string validation, but type can be any type if it can be transformed.

Request and response body is json, so keep the validation the same with types.

## Struct
```
IProblemBaseEntity --> IProblemEntity
     |                     |     |
     |--- IProblemExtra ---|     |--> ProblemEntity
     |                     |
     |                     |--> IProblemEntityWithExtra
     |                                        |
     |--> IProblemBaseEntityWithExtra         |--> ProblemDetailDto
                     |
                     |--> ProblemBaseDetailDto
```
