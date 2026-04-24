export interface AccountFieldSpec {
  name: string;
  example: string;
  description?: string;
}

export interface AccountTypeSpec {
  accountType: string;
  fields: AccountFieldSpec[];
  beneficiaryRequired: boolean;
}

export const accountTypeSpecs: Record<string, AccountTypeSpec> = {
  USD_ACCOUNT: {
    accountType: 'USD_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '123456789' },
      { name: 'routingNumber', example: '021000021' },
    ],
    beneficiaryRequired: true,
  },
  EUR_ACCOUNT: {
    accountType: 'EUR_ACCOUNT',
    fields: [
      { name: 'iban', example: 'DE89370400440532013000' },
      { name: 'swiftCode', example: 'DEUTDEFF', description: 'Optional' },
    ],
    beneficiaryRequired: true,
  },
  GBP_ACCOUNT: {
    accountType: 'GBP_ACCOUNT',
    fields: [
      { name: 'sortCode', example: '123456' },
      { name: 'accountNumber', example: '12345678' },
    ],
    beneficiaryRequired: true,
  },
  BRL_ACCOUNT: {
    accountType: 'BRL_ACCOUNT',
    fields: [
      { name: 'pixKey', example: '55119876543210' },
      { name: 'pixKeyType', example: 'PHONE', description: 'CPF, CNPJ, EMAIL, PHONE, or RANDOM' },
      { name: 'taxId', example: '12345678901' },
    ],
    beneficiaryRequired: true,
  },
  MXN_ACCOUNT: {
    accountType: 'MXN_ACCOUNT',
    fields: [
      { name: 'clabeNumber', example: '123456789012345678' },
    ],
    beneficiaryRequired: true,
  },
  INR_ACCOUNT: {
    accountType: 'INR_ACCOUNT',
    fields: [
      { name: 'vpa', example: 'customer@okbank' },
    ],
    beneficiaryRequired: true,
  },
  DKK_ACCOUNT: {
    accountType: 'DKK_ACCOUNT',
    fields: [
      { name: 'iban', example: 'DK5000400440116243' },
      { name: 'swiftCode', example: 'NDEADKKK', description: 'Optional' },
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
  HKD_ACCOUNT: {
    accountType: 'HKD_ACCOUNT',
    fields: [
      { name: 'bankName', example: 'HSBC Hong Kong' },
      { name: 'accountNumber', example: '123456789012' },
      { name: 'swiftCode', example: 'HSBCHKHHHKH' },
    ],
    beneficiaryRequired: true,
  },
  IDR_ACCOUNT: {
    accountType: 'IDR_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890' },
      { name: 'bankName', example: 'Bank Central Asia' },
      { name: 'swiftCode', example: 'CENAIDJA' },
      { name: 'phoneNumber', example: '+6281234567890' },
    ],
    beneficiaryRequired: true,
  },
  KES_ACCOUNT: {
    accountType: 'KES_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+254712345678' },
      { name: 'provider', example: 'M-PESA', description: 'Mobile money provider' },
    ],
    beneficiaryRequired: true,
  },
  MYR_ACCOUNT: {
    accountType: 'MYR_ACCOUNT',
    fields: [
      { name: 'bankName', example: 'Maybank' },
      { name: 'accountNumber', example: '1234567890' },
      { name: 'swiftCode', example: 'MABORUMMYYY' },
    ],
    beneficiaryRequired: true,
  },
  RWF_ACCOUNT: {
    accountType: 'RWF_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+250781234567' },
      { name: 'provider', example: 'MTN', description: 'MTN or AIRTEL' },
    ],
    beneficiaryRequired: true,
  },
  THB_ACCOUNT: {
    accountType: 'THB_ACCOUNT',
    fields: [
      { name: 'bankName', example: 'Bangkok Bank' },
      { name: 'accountNumber', example: '1234567890' },
      { name: 'swiftCode', example: 'BKKBTHBK' },
    ],
    beneficiaryRequired: true,
  },
  TZS_ACCOUNT: {
    accountType: 'TZS_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+255712345678' },
      { name: 'provider', example: 'VODACOM', description: 'AIRTEL or VODACOM' },
    ],
    beneficiaryRequired: true,
  },
  VND_ACCOUNT: {
    accountType: 'VND_ACCOUNT',
    fields: [
      { name: 'bankName', example: 'Vietcombank' },
      { name: 'accountNumber', example: '1234567890' },
      { name: 'swiftCode', example: 'BFTVVNVX' },
    ],
    beneficiaryRequired: true,
  },
  ZAR_ACCOUNT: {
    accountType: 'ZAR_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890' },
      { name: 'bankName', example: 'Standard Bank' },
    ],
    beneficiaryRequired: true,
  },
  ZMW_ACCOUNT: {
    accountType: 'ZMW_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+260971234567' },
      { name: 'provider', example: 'MTN', description: 'TNM, AIRTEL, ZAMTEL, or MTN' },
    ],
    beneficiaryRequired: true,
  },
  MWK_ACCOUNT: {
    accountType: 'MWK_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+265991234567' },
      { name: 'provider', example: 'AIRTEL', description: 'Mobile money provider' },
    ],
    beneficiaryRequired: true,
  },
  UGX_ACCOUNT: {
    accountType: 'UGX_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+256771234567' },
      { name: 'provider', example: 'MTN', description: 'Mobile money provider' },
    ],
    beneficiaryRequired: true,
  },
  XOF_ACCOUNT: {
    accountType: 'XOF_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+221771234567' },
      { name: 'provider', example: 'ORANGE', description: 'Mobile money provider' },
      { name: 'region', example: 'SN', description: 'Country code (BJ, CI, SN, or TG)' },
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
  ETHEREUM_WALLET: {
    accountType: 'ETHEREUM_WALLET',
    fields: [
      { name: 'address', example: '0xAbCDEF1234567890aBCdEf1234567890ABcDef12' },
    ],
    beneficiaryRequired: false,
  },
  AED_ACCOUNT: {
    accountType: 'AED_ACCOUNT',
    fields: [
      { name: 'iban', example: 'AE070331234567890123456', description: 'UAE IBAN (23 characters)' },
      { name: 'swiftCode', example: 'EBILAEAD', description: 'Optional' },
    ],
    beneficiaryRequired: true,
  },
  BWP_ACCOUNT: {
    accountType: 'BWP_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+26771234567' },
      { name: 'provider', example: 'Orange', description: 'Mobile money provider' },
    ],
    beneficiaryRequired: true,
  },
  XAF_ACCOUNT: {
    accountType: 'XAF_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+237671234567' },
      { name: 'provider', example: 'MTN', description: 'Mobile money provider' },
      { name: 'region', example: 'CM', description: 'Country code (CM or CG)' },
    ],
    beneficiaryRequired: true,
  },
  BDT_ACCOUNT: {
    accountType: 'BDT_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890123' },
      { name: 'branchCode', example: '12345', description: '5-digit branch code' },
      { name: 'phoneNumber', example: '+8801712345678' },
      { name: 'swiftCode', example: 'BABORUMMYYY', description: 'Optional' },
    ],
    beneficiaryRequired: true,
  },
  COP_ACCOUNT: {
    accountType: 'COP_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890' },
      { name: 'bankAccountType', example: 'SAVINGS', description: 'CHECKING or SAVINGS' },
      { name: 'phoneNumber', example: '+573001234567' },
    ],
    beneficiaryRequired: true,
  },
  EGP_ACCOUNT: {
    accountType: 'EGP_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890123456' },
      { name: 'iban', example: 'EG380019000500000000263180002', description: 'Optional' },
      { name: 'swiftCode', example: 'NBEGEGCX', description: 'Optional' },
    ],
    beneficiaryRequired: true,
  },
  GHS_ACCOUNT: {
    accountType: 'GHS_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890' },
      { name: 'phoneNumber', example: '+233241234567' },
    ],
    beneficiaryRequired: true,
  },
  GTQ_ACCOUNT: {
    accountType: 'GTQ_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890' },
      { name: 'phoneNumber', example: '+50212345678' },
    ],
    beneficiaryRequired: true,
  },
  HTG_ACCOUNT: {
    accountType: 'HTG_ACCOUNT',
    fields: [
      { name: 'phoneNumber', example: '+50934567890' },
    ],
    beneficiaryRequired: true,
  },
  JMD_ACCOUNT: {
    accountType: 'JMD_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890' },
      { name: 'branchCode', example: '12345', description: '5-digit branch code' },
      { name: 'bankAccountType', example: 'CHECKING', description: 'CHECKING or SAVINGS' },
    ],
    beneficiaryRequired: true,
  },
  PKR_ACCOUNT: {
    accountType: 'PKR_ACCOUNT',
    fields: [
      { name: 'accountNumber', example: '1234567890123456' },
      { name: 'phoneNumber', example: '+923001234567' },
      { name: 'iban', example: 'PK36SCBL0000001123456702', description: 'Optional' },
    ],
    beneficiaryRequired: true,
  },
};
