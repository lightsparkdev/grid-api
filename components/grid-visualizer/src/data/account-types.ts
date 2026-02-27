export interface AccountFieldSpec {
  name: string;
  example: string;
  description?: string;
}

export interface AccountTypeSpec {
  accountType: string;
  fields: AccountFieldSpec[];
  beneficiaryRequired: boolean;
  purposeOfPaymentRequired?: boolean;
}

export const accountTypeSpecs: Record<string, AccountTypeSpec> = {
  US_ACCOUNT: {
    accountType: 'US_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '123456789' },
      { name: 'routingNumber', example: '021000021' },
      { name: 'accountCategory', example: 'CHECKING', description: 'CHECKING or SAVINGS' },
    ],
    beneficiaryRequired: true,
  },
  IBAN: {
    accountType: 'IBAN',
    fields: [
      { name: 'iban', example: 'DE89370400440532013000' },
      { name: 'swiftBic', example: 'DEUTDEFF' },
    ],
    beneficiaryRequired: true,
  },
  GBP_ACCOUNT: {
    accountType: 'GBP_ACCOUNT',
    fields: [
      { name: 'sortCode', example: '20-00-00' },
      { name: 'accountNumber', example: '12345678' },
    ],
    beneficiaryRequired: true,
  },
  PIX: {
    accountType: 'PIX',
    fields: [
      { name: 'pixKey', example: '55119876543210' },
      { name: 'pixKeyType', example: 'PHONE', description: 'CPF, CNPJ, EMAIL, PHONE, or RANDOM' },
      { name: 'taxId', example: '12345678901' },
    ],
    beneficiaryRequired: true,
  },
  CLABE: {
    accountType: 'CLABE',
    fields: [
      { name: 'clabeNumber', example: '123456789012345678' },
    ],
    beneficiaryRequired: true,
  },
  UPI: {
    accountType: 'UPI',
    fields: [
      { name: 'vpa', example: 'customer@okbank' },
    ],
    beneficiaryRequired: true,
  },
  NGN_ACCOUNT: {
    accountType: 'NGN_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '0123456789' },
      { name: 'bankName', example: 'First Bank of Nigeria' },
    ],
    beneficiaryRequired: true,
    purposeOfPaymentRequired: true,
  },
  CAD_ACCOUNT: {
    accountType: 'CAD_ACCOUNT',
    fields: [
      { name: 'bankCode', example: '001' },
      { name: 'branchCode', example: '00012' },
      { name: 'accountNumber', example: '1234567' },
    ],
    beneficiaryRequired: true,
  },
  PHP_ACCOUNT: {
    accountType: 'PHP_ACCOUNT',
    fields: [
      { name: 'bankName', example: 'BDO Unibank' },
      { name: 'accountNumber', example: '001234567890' },
    ],
    beneficiaryRequired: true,
  },
  SGD_ACCOUNT: {
    accountType: 'SGD_ACCOUNT',
    fields: [
      { name: 'bankName', example: 'DBS Bank Ltd' },
      { name: 'swiftCode', example: 'DBSSSGSG' },
      { name: 'accountNumber', example: '0123456789' },
    ],
    beneficiaryRequired: true,
  },
  SPARK_WALLET: {
    accountType: 'SPARK_WALLET',
    fields: [
      { name: 'address', example: 'spark1pgssyuuuhnrrdjswal5c3s3rafw9w3y5dd4cjy' },
    ],
    beneficiaryRequired: false,
  },
  LIGHTNING: {
    accountType: 'LIGHTNING',
    fields: [
      { name: 'lightningAddress', example: 'customer@lightningwallet.com', description: 'One of: invoice, bolt12, or lightningAddress' },
    ],
    beneficiaryRequired: false,
  },
  SOLANA_WALLET: {
    accountType: 'SOLANA_WALLET',
    fields: [
      { name: 'address', example: '4Nd1m6Qkq7RfKuE5vQ9qP9Tn6H94Ueqb4xXHzsAbd8Wg' },
    ],
    beneficiaryRequired: false,
  },
  TRON_WALLET: {
    accountType: 'TRON_WALLET',
    fields: [
      { name: 'address', example: 'TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL' },
    ],
    beneficiaryRequired: false,
  },
  POLYGON_WALLET: {
    accountType: 'POLYGON_WALLET',
    fields: [
      { name: 'address', example: '0xAbCDEF1234567890aBCdEf1234567890ABcDef12' },
    ],
    beneficiaryRequired: false,
  },
  BASE_WALLET: {
    accountType: 'BASE_WALLET',
    fields: [
      { name: 'address', example: '0xAbCDEF1234567890aBCdEf1234567890ABcDef12' },
    ],
    beneficiaryRequired: false,
  },
  // --- Generic bank transfer account types (best-guess, confirm with API team) ---
  ...Object.fromEntries(
    [
      'XOF_ACCOUNT', 'XAF_ACCOUNT', 'GHS_ACCOUNT', 'KES_ACCOUNT', 'ZAR_ACCOUNT',
      'BWP_ACCOUNT', 'TZS_ACCOUNT', 'UGX_ACCOUNT', 'MWK_ACCOUNT', 'ZMW_ACCOUNT',
      'CNY_ACCOUNT', 'HKD_ACCOUNT', 'IDR_ACCOUNT', 'KRW_ACCOUNT', 'MYR_ACCOUNT',
      'THB_ACCOUNT', 'VND_ACCOUNT', 'LKR_ACCOUNT', 'CRC_ACCOUNT', 'CDF_ACCOUNT',
    ].map((type) => [
      type,
      {
        accountType: type,
        fields: [
          { name: 'accountNumber', example: '0123456789' },
          { name: 'bankName', example: 'Local Bank' },
        ],
        beneficiaryRequired: true,
      } satisfies AccountTypeSpec,
    ]),
  ),
};
