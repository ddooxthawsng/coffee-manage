// utils/vietqr.ts
export function getVietQRUrl({
                                 bankBin,
                                 accountNumber,
                                 amount,
                                 addInfo,
                             }: {
    bankBin: string; // Mã ngân hàng: VCB, TCB, BIDV, ...
    accountNumber: string;
    amount?: number;
    addInfo?: string;
}) {
    let url = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png`;
    const params = [];
    if (amount) params.push(`amount=${amount}`);
    if (addInfo) params.push(`addInfo=${encodeURIComponent(addInfo)}`);
    if (params.length) url += "?" + params.join("&");
    return url;
}
