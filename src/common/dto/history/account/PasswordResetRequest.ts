export interface PasswordResetRequest {
    readonly token: string;
    readonly password: string;
}