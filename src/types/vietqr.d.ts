declare module "vietqr" {
    export function genVietQR(params: {
        bin: string;
        accountNumber: string;
        accountName: string;
        amount?: string;
        memo?: string;
    }): string;
}