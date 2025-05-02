/**
 * @module RequirementsLinterApiTypes
 *
 * Type definitions and interfaces for the requirements linting API.
 * Includes types for specification evaluation requests/responses and
 * quick specification validation checks.
 */
export interface IQuickCheckRequest {
    statement: string;
    beFriendly?: boolean | undefined;
    sessionId: string;
}
export interface IQuickCheckResponse {
    isSpecification: boolean;
}
export interface ISpecificationEvaluationRequest {
    specification: string;
    sessionId: string;
}
export interface ISpecificationEvaluation {
    evaluation: string;
    proposedNewSpecification: string;
}
//# sourceMappingURL=RequirementsLinterApiTypes.d.ts.map