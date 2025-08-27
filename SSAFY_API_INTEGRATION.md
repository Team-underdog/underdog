# SSAFY API 연동 가이드

## 📋 개요
SSAFY API를 사용하여 학생 이메일 검증 및 정보 조회를 위한 연동 문서입니다.

## 🔑 API 키 설정
- **API 키**: `1924d3d047eb472ab5a81df01977485c`
- **환경변수**: `SSAFY_API_KEY`
- **설정 파일**: `hackathon/backend/.env`

## 📋 공통 헤더 구조 (Header01)

모든 SSAFY API 요청에 필요한 공통 헤더 정보:

### 헤더 형식
```json
{
  "Header": {
    "apiName": "inqureBankCodes",
    "transmissionDate": "20240207",
    "transmissionTime": "133415",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inqureBankCodes",
    "institutionTransactionUniqueNo": "20191129000000000001",
    "apiKey": "8ce632cf95b84dc581b30ad106f43bee",
    "userKey": "826b058d-34ab-4ad5-80c1-a5a9c2862006"
  }
}
```

### 헤더 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| apiName | API 이름 | String | 30 | Y | 호출 API URI의 마지막 path 명 |
| transmissionDate | 전송일자 | String | 8 | Y | API 전송일자 (YYYYMMDD) |
| transmissionTime | 전송시각 | String | 6 | Y | API 전송시각 (HHMMSS) ±5분 |
| institutionCode | 기관코드 | String | 5 | Y | '00100'로 고정 |
| fintechAppNo | 핀테크 앱 일련번호 | String | 3 | Y | '001'로 고정 |
| apiServiceCode | API서비스코드 | String | 30 | Y | API 이름 필드와 동일 |
| institutionTransactionUniqueNo | 기관거래고유번호 | String | 20 | Y | 새로운 번호로 임의 채번 (YYYYMMDD + HHMMSS + 일련번호 6자리) |
| apiKey | API KEY | String | 40 | Y | 앱 관리자가 발급받은 API KEY |
| userKey | USER KEY | String | 40 | Y | 앱 사용자가 회원가입할때 발급받은 USER KEY |

## 🌐 API 엔드포인트

### 1. 앱 API KEY 발급
**인터페이스 ID**: `MANAGER_01`  
**인터페이스명**: 앱 API KEY 발급

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/app/issuedApiKey
```

#### 요청 헤더
**TODO: 실제 헤더 형식 입력**

```http
Content-Type: application/json
Authorization: [Bearer/ApiKey] {API_KEY}
```

#### 요청 본문
```json
{
  "managerId": "ssafy@ssafy.co.kr"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| managerId | 관리자 ID | String | 30 | Y | 이메일 형식 |

### 2. 앱 API KEY 재발급
**인터페이스 ID**: `MANAGER_02`  
**인터페이스명**: 앱 API KEY 재발급

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/app/reIssuedApiKey
```

#### 요청 헤더
**TODO: 실제 헤더 형식 입력**

```http
Content-Type: application/json
Authorization: [Bearer/ApiKey] {API_KEY}
```

#### 요청 본문
```json
{
  "managerId": "ssafy@ssafy.co.kr"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| managerId | 관리자 ID | String | 30 | Y | 이메일 형식 |

### 3. 사용자 계정 생성
**인터페이스 ID**: `MEMBER_01`  
**인터페이스명**: 사용자 계정 생성

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/member/
```

#### 요청 헤더
**TODO: 실제 헤더 형식 입력**

```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "apiKey": "8644e48ee75740469ef8b5214499e5f7",
  "userId": "test@ssafy.co.kr"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| apiKey | API 키 | String | 10 | Y | 앱 관리자가 SSAFY 개발 센터에서 발급 받은 API KEY |
| userId | 사용자 ID | String | 40 | Y | 이메일 형식 |

### 4. 사용자 계정 조회
**인터페이스 ID**: `MEMBER_02`  
**인터페이스명**: 사용자 계정 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/member/search
```

#### 요청 헤더
**TODO: 실제 헤더 형식 입력**

```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "apiKey": "8644e48ee75740469ef8b5214499e5f7",
  "userId": "test@ssafy.co.kr"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| apiKey | API 키 | String | 10 | Y | 앱 관리자가 SSAFY 개발 센터에서 발급 받은 API KEY |
| userId | 사용자 ID | String | 40 | Y | 이메일 형식 |

### 5. 은행코드 조회
**인터페이스 ID**: `Bank01`  
**인터페이스명**: 은행코드 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/bank/inquireBankCodes
```

#### 요청 헤더
```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireBankCodes",
    "transmissionDate": "20240401",
    "transmissionTime": "135500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireBankCodes",
    "institutionTransactionUniqueNo": "20240215121212123557",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 6. 통화코드 조회
**인터페이스 ID**: `CURRENCY_01`  
**인터페이스명**: 통화코드 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/bank/inquireBankCurrency
```

#### 요청 헤더
```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireBankCurrency",
    "transmissionDate": "20240724",
    "transmissionTime": "154635",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireBankCurrency",
    "institutionTransactionUniqueNo": "20240724154635412480",
    "apiKey": "e8fb2ac291804bc98834ff7bcef7e340"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 7. 수시입출금 상품등록
**인터페이스 ID**: `DEMAND_DEPOSIT_01`  
**인터페이스명**: 수시입출금 상품등록

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/createDemandDeposit
```

#### 요청 헤더
```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createDemandDeposit",
    "transmissionDate": "20240401",
    "transmissionTime": "095500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createDemandDeposit",
    "institutionTransactionUniqueNo": "20240215121212123560",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29"
  },
  "bankCode": "001",
  "accountName": "한국은행 수시입출금 상품명",
  "accountDescription": "한국은행 수시입출금 상품설명"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |
| bankCode | 은행코드 | String | 3 | Y | |
| accountName | 상품명 | String | 20 | Y | |
| accountDescription | 상품설명 | String | 255 | N | |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 8. 상품 조회
**인터페이스 ID**: `DEMAND_DEPOSIT_02`  
**인터페이스명**: 상품 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositList
```

#### 요청 헤더
```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDemandDepositList",
    "transmissionDate": "20240401",
    "transmissionTime": "100100",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDemandDepositList",
    "institutionTransactionUniqueNo": "20240215121212123561",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 9. 계좌 생성
**인터페이스 ID**: `DEMAND_DEPOSIT_03`  
**인터페이스명**: 계좌 생성

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/createDemandDepositAccount
```

#### 요청 헤더
```http
Content-Type: application/json
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createDemandDepositAccount",
    "transmissionDate": "20240401",
    "transmissionTime": "100500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createDemandDepositAccount",
    "institutionTransactionUniqueNo": "20240215121212123457",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountTypeUniqueNo": "001-1-ffa4253081d540"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountTypeUniqueNo | 상품 고유번호 | String | 20 | Y | |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 10. 계좌 목록 조회
**인터페이스 ID**: `DEMAND_DEPOSIT_04`  
**인터페이스명**: 계좌 목록 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDemandDepositAccountList",
    "transmissionDate": "20240401",
    "transmissionTime": "101000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDemandDepositAccountList",
    "institutionTransactionUniqueNo": "20240215121212123473",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |

### 11. 계좌 조회(단건)
**인터페이스 ID**: `DEMAND_DEPOSIT_05`  
**인터페이스명**: 계좌 조회(단건)

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDemandDepositAccount",
    "transmissionDate": "20240401",
    "transmissionTime": "101500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDemandDepositAccount",
    "institutionTransactionUniqueNo": "20240215121212123455",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 12. 예금주 조회
**인터페이스 ID**: `DEMAND_DEPOSIT_06`  
**인터페이스명**: 예금주 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountHolderName
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDemandDepositAccountHolderName",
    "transmissionDate": "20240401",
    "transmissionTime": "102000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDemandDepositAccountHolderName",
    "institutionTransactionUniqueNo": "20240215121212123451",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 13. 계좌 잔액 조회
**인터페이스 ID**: `DEMAND_DEPOSIT_07`  
**인터페이스명**: 계좌 잔액 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountBalance
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDemandDepositAccountBalance",
    "transmissionDate": "20240401",
    "transmissionTime": "102500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDemandDepositAccountBalance",
    "institutionTransactionUniqueNo": "20240215121212123463",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 14. 계좌 출금
**인터페이스 ID**: `DEMAND_DEPOSIT_08`  
**인터페이스명**: 계좌 출금

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountWithdrawal
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "updateDemandDepositAccountWithdrawal",
    "transmissionDate": "20240401",
    "transmissionTime": "102500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "updateDemandDepositAccountWithdrawal",
    "institutionTransactionUniqueNo": "20240215121212123456",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792",
  "transactionBalance": "100000",
  "transactionSummary": "(수시입출금) : 출금"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| transactionBalance | 출금금액 | Double | - | Y | 정수만 가능 |
| transactionSummary | 출금계좌요약 | String | 255 | N | |

### 15. 계좌 입금
**인터페이스 ID**: `DEMAND_DEPOSIT_09`  
**인터페이스명**: 계좌 입금

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountDeposit
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "updateDemandDepositAccountDeposit",
    "transmissionDate": "20240401",
    "transmissionTime": "102500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "updateDemandDepositAccountDeposit",
    "institutionTransactionUniqueNo": "20240215121212123463",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792",
  "transactionBalance": "100000000",
  "transactionSummary": "(수시입출금) : 입금"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| transactionBalance | 입금금액 | Long | - | Y | 정수만 가능 |
| transactionSummary | 입금계좌요약 | String | 255 | N | |

### 16. 계좌 이체
**인터페이스 ID**: `DEMAND_DEPOSIT_10`  
**인터페이스명**: 계좌 이체

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountTransfer
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "updateDemandDepositAccountTransfer",
    "transmissionDate": "20240401",
    "transmissionTime": "103500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "updateDemandDepositAccountTransfer",
    "institutionTransactionUniqueNo": "20240215121212123453",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "depositAccountNo": "0204667768182760",
  "depositTransactionSummary": "(수시입출금) : 입금(이체)",
  "transactionBalance": "10000000",
  "withdrawalAccountNo": "0016174648358792",
  "withdrawalTransactionSummary": "(수시입출금) : 출금(이체)"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| depositAccountNo | 입금계좌번호 | String | 16 | Y | 원화, 외화 계좌 가능 |
| depositTransactionSummary | 거래 요약내용 (입금계좌) | String | 255 | N | |
| transactionBalance | 거래금액 | Long | - | Y | 출금할 금액 입력 |
| withdrawalAccountNo | 출금계좌번호 | String | 16 | Y | 원화 계좌만 가능 |
| withdrawalTransactionSummary | 거래 요약내용 (출금계좌) | String | 255 | N | |

### 17. 이체한도변경
**인터페이스 ID**: `DEMAND_DEPOSIT_11`  
**인터페이스명**: 이체한도변경

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateTransferLimit
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "updateTransferLimit",
    "transmissionDate": "20240401",
    "transmissionTime": "104000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "updateTransferLimit",
    "institutionTransactionUniqueNo": "20240215121212123452",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792",
  "oneTimeTransferLimit": "20000000",
  "dailyTransferLimit": "100000000"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| oneTimeTransferLimit | 1회 이체한도 | Long | - | Y | 1원 ~ 100억 |
| dailyTransferLimit | 1일 이체한도 | Long | - | Y | 1원 ~ 2000억 |

### 18. 계좌거래내역조회
**인터페이스 ID**: `DEMAND_DEPOSIT_12`  
**인터페이스명**: 계좌거래내역조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireTransactionHistoryList",
    "transmissionDate": "20240401",
    "transmissionTime": "105000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireTransactionHistoryList",
    "institutionTransactionUniqueNo": "20240215121212123459",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792",
  "startDate": "20240101",
  "endDate": "20241231",
  "transactionType": "A",
  "orderByType": "ASC"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| startDate | 조회시작일자 | String | 8 | Y | YYYYMMDD |
| endDate | 조회종료일자 | String | 8 | Y | YYYYMMDD |
| transactionType | 거래구분 | String | 1 | Y | M:입금 D:출금 A:전체 |
| orderByType | 정렬순서 | String | 4 | Y | ASC:오름차순(이전거래), DESC:내림차순(최근거래) |

### 19. 계좌거래내역조회(단건)
**인터페이스 ID**: `DEMAND_DEPOSIT_13`  
**인터페이스명**: 계좌거래내역조회(단건)

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistory
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireTransactionHistory",
    "transmissionDate": "20240401",
    "transmissionTime": "105500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireTransactionHistory",
    "institutionTransactionUniqueNo": "20240215121212123452",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0016174648358792",
  "transactionUniqueNo": "61"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| transactionUniqueNo | 거래고유번호 | Long | - | Y | |

### 20. 계좌해지
**인터페이스 ID**: `DEMAND_DEPOSIT_14`  
**인터페이스명**: 계좌해지

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/deleteDemandDepositAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "deleteDemandDepositAccount",
    "transmissionDate": "20240401",
    "transmissionTime": "112000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "deleteDemandDepositAccount",
    "institutionTransactionUniqueNo": "20240215121212123455",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0018770964252220",
  "refundAccountNo": "0324003842129948"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| refundAccountNo | 금액반환계좌번호 | String | 16 | N | |

### 21. 예금상품등록
**인터페이스 ID**: `DEPOSIT_01`  
**인터페이스명**: 예금상품등록

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/createDepositProduct
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createDepositProduct",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createDeposit",
    "institutionTransactionUniqueNo": "20240215121212123498",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42"
  },
  "bankCode": "002",
  "accountName": "특판 예금",
  "accountDescription": "선착순 특판 계좌",
  "subscriptionPeriod": "10",
  "minSubscriptionBalance": "200000",
  "maxSubscriptionBalance": "3000000",
  "interestRate": "15",
  "rateDescription": "이자 15프로 단기 가입"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |
| bankCode | 은행코드 | String | 3 | Y | |
| accountName | 상품명 | String | 20 | Y | 예금 상품명 입력 (ex. 7일 예금) |
| accountDescription | 상품설명 | String | 255 | N | 예금 상품 설명 입력 |
| subscriptionPeriod | 가입기간 | String | 20 | Y | 2 이상 ~ 365일이하 / 단위(일) |
| minSubscriptionBalance | 최소가입가능금액 | Long | - | Y | 1 이상 / 단위(원) |
| maxSubscriptionBalance | 최대가입가능금액 | Long | - | Y | 100000000(1억) 이하 / 단위(원) |
| interestRate | 이자율 | double | - | Y | 0.1 이상 ~ 20 이하/ 단위(%) |
| rateDescription | 이자율 설명 | String | 255 | N | |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 22. 예금상품조회
**인터페이스 ID**: `DEPOSIT_02`  
**인터페이스명**: 예금상품조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/inquireDepositProducts
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDepositProducts",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDepositProducts",
    "institutionTransactionUniqueNo": "20240215121212123494",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 23. 예금계좌생성
**인터페이스 ID**: `DEPOSIT_03`  
**인터페이스명**: 예금계좌생성

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/createDepositAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createDepositAccount",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createDepositAccount",
    "institutionTransactionUniqueNo": "20240215121212123492",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  },
  "withdrawalAccountNo": "0011541149756547",
  "accountTypeUniqueNo": "003-2-67718ffc",
  "depositBalance": "80000000"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| withdrawalAccountNo | 출금계좌번호 | String | 20 | Y | 출금할 수시입출금 계좌번호 기입 |
| accountTypeUniqueNo | 상품고유번호 | String | 20 | Y | 가입할 예금 상품고유번호 기입 |
| depositBalance | 가입금액 | Long | - | Y | 가입할 예금의 가입 가능금액 범위 내 기입 |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 24. 예금계좌목록조회
**인터페이스 ID**: `DEPOSIT_04`  
**인터페이스명**: 예금계좌목록조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/inquireDepositInfoList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDepositInfoList",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDepositInfoList",
    "institutionTransactionUniqueNo": "20240215171212123492",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 25. 예금계좌조회(단건)
**인터페이스 ID**: `DEPOSIT_05`  
**인터페이스명**: 예금계좌조회(단건)

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/inquireDepositInfoDetail
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDepositInfoDetail",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDepositInfoDetail",
    "institutionTransactionUniqueNo": "20240215121212123491",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  },
  "accountNo": "0019016181"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 26. 예금납입상세조회
**인터페이스 ID**: `DEPOSIT_06`  
**인터페이스명**: 예금납입상세조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/inquireDepositPayment
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDepositPayment",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireDepositPayment",
    "institutionTransactionUniqueNo": "20240215121212123489",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  },
  "accountNo": "0019169157"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 27. 예금만기이자조회
**인터페이스 ID**: `DEPOSIT_07`  
**인터페이스명**: 예금만기이자조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/inquireDepositExpiryInterest
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDepositExpiryInterest",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireExpiryInterest",
    "institutionTransactionUniqueNo": "20240215121212123498",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  },
  "accountNo": "0024379394"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 28. 예금중도해지이자조회
**인터페이스 ID**: `DEPOSIT_08`  
**인터페이스명**: 예금중도해지이자조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/inquireDepositEarlyTerminationInterest
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireDepositEarlyTerminationInterest",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireEarlyTerminationInterest",
    "institutionTransactionUniqueNo": "20240215121212123498",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  },
  "accountNo": "0024379394"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 29. 예금계좌해지
**인터페이스 ID**: `DEPOSIT_09`  
**인터페이스명**: 예금계좌해지

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/deposit/deleteDepositAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "deleteDepositAccount",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "deleteAccount",
    "institutionTransactionUniqueNo": "20240215121212123498",
    "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
    "userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
  },
  "accountNo": "0011347488"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 30. 적금상품등록
**인터페이스 ID**: `SAVINGS_01`  
**인터페이스명**: 적금상품등록

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/createProduct
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createProduct",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createProduct",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c"
  },
  "bankCode": "001",
  "accountName": "7일 적금",
  "accountDescription": "7일 적금입니다",
  "subscriptionPeriod": "7",
  "minSubscriptionBalance": "10000",
  "maxSubscriptionBalance": "1000000",
  "interestRate": "10",
  "rateDescription": "10% 이자를 지급합니다"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |
| bankCode | 은행코드 | String | 3 | Y | |
| accountName | 상품명 | String | 20 | Y | 적금 상품명 입력 (ex. 7일 적금) |
| accountDescription | 상품설명 | String | 255 | N | 적금 상품 설명 입력 |
| subscriptionPeriod | 가입 기간 | String | 20 | Y | 2일 이상 ~ 365일 이하 |
| minSubscriptionBalance | 최소 가입 가능금액 | Long | - | Y | 1 이상 단위(원) |
| maxSubscriptionBalance | 최대 가입 가능금액 | Long | - | Y | 1000000(1백만) 이하 단위(원) |
| interestRate | 이자율 | double | - | Y | 0.1 이상 ~ 20 이하 단위(%) |
| rateDescription | 이자율 설명 | String | 255 | N | |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 31. 적금상품조회
**인터페이스 ID**: `SAVINGS_02`  
**인터페이스명**: 적금상품조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/inquireSavingsProducts
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireSavingsProducts",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireSavingsProducts",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 32. 적금계좌생성
**인터페이스 ID**: `SAVINGS_03`  
**인터페이스명**: 적금계좌생성

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/createAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createAccount",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createAccount",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c",
    "userKey": "539bee99-df91-4e18-9172-1dfd71c44b2c"
  },
  "accountTypeUniqueNo": "001-3-5e4f5b87fa2047",
  "depositBalance": "100000",
  "withdrawalAccountNo": "0328073978527981"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| withdrawalAccountNo | 출금계좌번호 | String | 16 | Y | 가입 금액에 대해 자동이체할 수시입출금 계좌번호 기입 |
| accountTypeUniqueNo | 상품고유번호 | String | 20 | Y | 가입할 적금 상품고유번호 기입 |
| depositBalance | 가입금액 | Long | - | Y | 가입할 적금의 가입 가능금액 범위 내 기입 |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 33. 적금계좌목록조회
**인터페이스 ID**: `SAVINGS_04`  
**인터페이스명**: 적금계좌목록조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/inquireAccountList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireAccountList",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireAccountList",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c",
    "userKey": "539bee99-df91-4e18-9172-1dfd71c44b2c"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 34. 적금계좌조회(단건)
**인터페이스 ID**: `SAVINGS_05`  
**인터페이스명**: 적금계좌조회(단건)

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/inquireAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireAccount",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireAccount",
    "institutionTransactionUniqueNo": "20240215121212123467",
    "apiKey": "8644e48ee75740469ef8b5214499e5f7",
    "userKey": "cf1d49ba-663b-495d-9227-fc2643aa7c5e"
  },
  "accountNo": "1234567890123"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 35. 적금납입회차조회
**인터페이스 ID**: `SAVINGS_06`  
**인터페이스명**: 적금납입회차조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/inquirePayment
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquirePayment",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquirePayment",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c",
    "userKey": "539bee99-df91-4e18-9172-1dfd71c44b2c"
  },
  "accountNo": "0017675199"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API들은 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 36. 적금만기이자조회
**인터페이스 ID**: `SAVINGS_07`  
**인터페이스명**: 적금만기이자조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/inquireExpiryInterest
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireExpiryInterest",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireExpiryInterest",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c",
    "userKey": "539bee99-df91-4e18-9172-1dfd71c44b2c"
  },
  "accountNo": "0017675199"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 37. 적금중도해지이자조회
**인터페이스 ID**: `SAVINGS_08`  
**인터페이스명**: 적금중도해지이자조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/inquireEarlyTerminationInterest
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireEarlyTerminationInterest",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireEarlyTerminationInterest",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c",
    "userKey": "539bee99-df91-4e18-9172-1dfd71c44b2c"
  },
  "accountNo": "0017675199"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API들은 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

### 38. 적금계좌해지
**인터페이스 ID**: `SAVINGS_09`  
**인터페이스명**: 적금계좌해지

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/deleteAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "deleteAccount",
    "transmissionDate": "20240101",
    "transmissionTime": "121212",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "deleteAccount",
    "institutionTransactionUniqueNo": "20240101121212123456",
    "apiKey": "36128418bded4a9a9b7cf72f23e6943c",
    "userKey": "539bee99-df91-4e18-9172-1dfd71c44b2c"
  },
  "accountNo": "0017675199"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

---

## 🎉 **SSAFY API 연동 문서 완성!**

### 📊 **전체 API 요약 (총 38개)**

#### 🔑 **관리자 API** (2개 - userKey 불필요):
1-2. **API KEY 발급/재발급** (`MANAGER_01/02`)

#### 👤 **사용자 계정 API** (2개 - userKey 불필요):
3-4. **사용자 계정 생성/조회** (`MEMBER_01/02`)

#### 🏦 **은행/상품 API** (4개 - userKey 불필요):
5-8. **은행코드, 통화코드, 수시입출금 상품등록/조회** (`Bank01`, `CURRENCY_01`, `DEMAND_DEPOSIT_01/02`)

#### 💳 **수시입출금 계좌 API** (12개 - userKey 필요):
9-20. **계좌 생성~해지, 거래, 이체, 한도변경, 거래내역** (`DEMAND_DEPOSIT_03~14`)

#### 💰 **예금 상품/계좌 API** (9개):
21-29. **예금상품등록~계좌해지** (`DEPOSIT_01~09`)

#### 📈 **적금 상품/계좌 API** (9개):
30-38. **적금상품등록~계좌해지** (`SAVINGS_01~09`)

### 🎯 **Campus Credo 앱 연동 핵심 API**:
- **MEMBER_02**: 학생 이메일 검증 ✅
- **DEMAND_DEPOSIT_07**: 계좌 잔액 조회 ✅
- **DEMAND_DEPOSIT_12**: 거래내역 조회 → 크로니클 피드 ✅
- **DEPOSIT/SAVINGS**: 예적금 상품 → 금융 퀘스트 ✅

### 39. 신용등급 기준 조회
**인터페이스 ID**: `LOAN_01`  
**인터페이스명**: 신용등급 기준 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/inquireAssetBasedCreditRatingList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireAssetBasedCreditRatingList",
    "transmissionDate": "20240412",
    "transmissionTime": "131500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireAssetBasedCreditRatingList",
    "institutionTransactionUniqueNo": "20240215121212123553",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API는 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 40. 대출 상품 등록
**인터페이스 ID**: `LOAN_02`  
**인터페이스명**: 대출 상품 등록

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/createLoanProduct
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createLoanProduct",
    "transmissionDate": "20240415",
    "transmissionTime": "145000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createLoanProduct",
    "institutionTransactionUniqueNo": "20240215121212123555",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29"
  },
  "bankCode": "001",
  "accountName": "한국은행 저금리 대출",
  "accountDescription": null,
  "ratingUniqueNo": "RT-0fa85f6425e811ea4",
  "loanPeriod": "3",
  "minLoanBalance": "10000",
  "maxLoanBalance": "100000000",
  "interestRate": "5"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |
| bankCode | 은행코드 | String | 16 | Y | |
| accountName | 상품명 | String | 20 | Y | 대출 상품명 입력 |
| accountDescription | 상품설명 | String | 255 | N | 대출 상품 설명 입력 |
| ratingUniqueNo | 신용등급 기준 고유번호 | String | 20 | Y | |
| loanPeriod | 대출기간 | int | - | Y | 2 ~ 365 / 단위(일) |
| minLoanBalance | 최소 대출 금액 | Long | - | Y | 1000 이상 / 단위(원) |
| maxLoanBalance | 최대 대출 금액 | Long | - | Y | 300000000(3억) 이하 / 단위(원) |
| interestRate | 기본 금리 | double | - | Y | 0.1 이상 ~ 20 이하 단위(%) |

### 41. 대출 상품 조회
**인터페이스 ID**: `LOAN_03`  
**인터페이스명**: 대출 상품 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/inquireLoanProductList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireLoanProductList",
    "transmissionDate": "20240415",
    "transmissionTime": "151000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireLoanProductList",
    "institutionTransactionUniqueNo": "20240215121212123554",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 제외 |

> **참고**: 이 API들은 공통 헤더에서 `userKey`를 **제외**하고 사용합니다.

### 42. 내 신용등급 조회
**인터페이스 ID**: `LOAN_04`  
**인터페이스명**: 내 신용등급 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/inquireMyCreditRating
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireMyCreditRating",
    "transmissionDate": "20240415",
    "transmissionTime": "151500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireMyCreditRating",
    "institutionTransactionUniqueNo": "20240215121212123552",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |

### 43. 대출심사 신청
**인터페이스 ID**: `LOAN_05`  
**인터페이스명**: 대출심사 신청

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/createLoanApplication
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createLoanApplication",
    "transmissionDate": "20240411",
    "transmissionTime": "090500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createLoanApplication",
    "institutionTransactionUniqueNo": "20240215121212123559",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountTypeUniqueNo": "004-4-67140989453846"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountTypeUniqueNo | 상품 고유번호 | String | 20 | Y | |

> **참고**: 이 API들은 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

---

## 🎉 **SSAFY API 연동 문서 완성!**

### 📊 **전체 API 요약 (총 43개)**

#### 🔑 **관리자 API** (2개 - userKey 불필요):
1-2. **API KEY 발급/재발급** (`MANAGER_01/02`)

#### 👤 **사용자 계정 API** (2개 - userKey 불필요):
3-4. **사용자 계정 생성/조회** (`MEMBER_01/02`)

#### 🏦 **은행/상품 API** (4개 - userKey 불필요):
5-8. **은행코드, 통화코드, 수시입출금 상품등록/조회** (`Bank01`, `CURRENCY_01`, `DEMAND_DEPOSIT_01/02`)

#### 💳 **수시입출금 계좌 API** (12개 - userKey 필요):
9-20. **계좌 생성~해지, 거래, 이체, 한도변경, 거래내역** (`DEMAND_DEPOSIT_03~14`)

#### 💰 **예금 상품/계좌 API** (9개):
21-29. **예금상품등록~계좌해지** (`DEPOSIT_01~09`)

#### 📈 **적금 상품/계좌 API** (9개):
30-38. **적금상품등록~계좌해지** (`SAVINGS_01~09`)

#### 🏠 **대출 상품/심사 API** (5개):
39-43. **신용등급기준조회, 대출상품등록/조회, 내신용등급조회, 대출심사신청** (`LOAN_01~05`)

### 🎯 **Campus Credo 앱 연동 핵심 API**:
- **MEMBER_02**: 학생 이메일 검증 ✅
- **DEMAND_DEPOSIT_07**: 계좌 잔액 조회 ✅
- **DEMAND_DEPOSIT_12**: 거래내역 조회 → 크로니클 피드 ✅
- **DEPOSIT/SAVINGS**: 예적금 상품 → 금융 퀘스트 ✅
- **LOAN_04**: 내 신용등급 조회 → 개인 신용 점수 ✅

### 44. 대출심사 목록 조회
**인터페이스 ID**: `LOAN_06`  
**인터페이스명**: 대출심사 목록 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/inquireLoanApplicationList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireLoanApplicationList",
    "transmissionDate": "20240415",
    "transmissionTime": "152500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireLoanApplicationList",
    "institutionTransactionUniqueNo": "20240215121212123554",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |

### 45. 대출 상품 가입
**인터페이스 ID**: `LOAN_07`  
**인터페이스명**: 대출 상품 가입

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/createLoanAccount
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "createLoanAccount",
    "transmissionDate": "20240415",
    "transmissionTime": "153000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "createLoanAccount",
    "institutionTransactionUniqueNo": "20240215121212123558",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountTypeUniqueNo": "004-4-67140989453846",
  "loanBalance": "100000000",
  "withdrawalAccountNo": "0324003842129948"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountTypeUniqueNo | 상품 고유번호 | String | 20 | Y | |
| loanBalance | 대출금 | Long | - | Y | |
| withdrawalAccountNo | 출금 계좌번호 | String | 16 | Y | 수시입출금 계좌(수시입출금 계좌로 대출금 지급) |

### 46. 대출 상품 가입 목록 조회
**인터페이스 ID**: `LOAN_08`  
**인터페이스명**: 대출 상품 가입 목록 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/inquireLoanAccountList
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireLoanAccountList",
    "transmissionDate": "20240415",
    "transmissionTime": "153500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireLoanAccountList",
    "institutionTransactionUniqueNo": "20240215121212123561",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  }
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |

### 47. 대출 상환 내역 조회
**인터페이스 ID**: `LOAN_09`  
**인터페이스명**: 대출 상환 내역 조회

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/inquireRepaymentRecords
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "inquireRepaymentRecords",
    "transmissionDate": "20240415",
    "transmissionTime": "154500",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "inquireRepaymentRecords",
    "institutionTransactionUniqueNo": "20240215121212123571",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0044815881614041"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

> **참고**: 이 API들은 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

---

## 🎉 **SSAFY API 연동 문서 완성!**

### 📊 **전체 API 요약 (총 47개)**

#### 🔑 **관리자 API** (2개 - userKey 불필요):
1-2. **API KEY 발급/재발급** (`MANAGER_01/02`)

#### 👤 **사용자 계정 API** (2개 - userKey 불필요):
3-4. **사용자 계정 생성/조회** (`MEMBER_01/02`)

#### 🏦 **은행/상품 API** (4개 - userKey 불필요):
5-8. **은행코드, 통화코드, 수시입출금 상품등록/조회** (`Bank01`, `CURRENCY_01`, `DEMAND_DEPOSIT_01/02`)

#### 💳 **수시입출금 계좌 API** (12개 - userKey 필요):
9-20. **계좌 생성~해지, 거래, 이체, 한도변경, 거래내역** (`DEMAND_DEPOSIT_03~14`)

#### 💰 **예금 상품/계좌 API** (9개):
21-29. **예금상품등록~계좌해지** (`DEPOSIT_01~09`)

#### 📈 **적금 상품/계좌 API** (9개):
30-38. **적금상품등록~계좌해지** (`SAVINGS_01~09`)

#### 🏠 **대출 상품/심사/계좌 API** (9개):
39-47. **신용등급기준조회~대출상환내역조회** (`LOAN_01~09`)

### 🎯 **Campus Credo 앱 연동 핵심 API**:
- **MEMBER_02**: 학생 이메일 검증 ✅
- **DEMAND_DEPOSIT_07**: 계좌 잔액 조회 ✅
- **DEMAND_DEPOSIT_12**: 거래내역 조회 → 크로니클 피드 ✅
- **DEPOSIT/SAVINGS**: 예적금 상품 → 금융 퀘스트 ✅
- **LOAN_04**: 내 신용등급 조회 → 개인 신용 점수 ✅
- **LOAN_09**: 대출 상환 내역 → 크로니클 피드 ✅

### 48. 대출 일시납 상환
**인터페이스 ID**: `LOAN_10`  
**인터페이스명**: 대출 일시납 상환

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/loan/updateRepaymentLoanBalanceInFull
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "updateRepaymentLoanBalanceInFull",
    "transmissionDate": "20240416",
    "transmissionTime": "104000",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "updateRepaymentLoanBalanceInFull",
    "institutionTransactionUniqueNo": "20240215121212123562",
    "apiKey": "6a028e66ddbf42a6b783d78963163e29",
    "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
  },
  "accountNo": "0044815881614041"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |

### 49. 1원 송금 (계좌 인증)
**인터페이스 ID**: `ACCOUNT_AUTH_01`  
**인터페이스명**: 1원 송금

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/openAccountAuth
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "openAccountAuth",
    "transmissionDate": "20240723",
    "transmissionTime": "152345",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "openAccountAuth",
    "institutionTransactionUniqueNo": "20240723152345666098",
    "apiKey": "e8fb2ac291804bc98834ff7bcef7e340",
    "userKey": "633d65a0-67c4-48b2-9bbf-94b948d8e141"
  },
  "accountNo": "0011214764051239",
  "authText": "SSAFY"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| authText | 기업명 | String | 20 | Y | 회사 이니셜, 메세지 등을 통해 앱 관리자가 본인을 식별할 수 있도록 임의의 문자 입력 |

### 50. 1원 송금 검증
**인터페이스 ID**: `ACCOUNT_AUTH_02`  
**인터페이스명**: 1원 송금 검증

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/accountAuth/checkAuthCode
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "checkAuthCode",
    "transmissionDate": "20240723",
    "transmissionTime": "152415",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "checkAuthCode",
    "institutionTransactionUniqueNo": "20240723152415461262",
    "apiKey": "e8fb2ac291804bc98834ff7bcef7e340",
    "userKey": "633d65a0-67c4-48b2-9bbf-94b948d8e141"
  },
  "accountNo": "0011214764051239",
  "authText": "SSAFY",
  "authCode": "8212"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| authText | 기업명 | String | 20 | Y | 회사 이니셜, 메세지 등을 통해 입력한 문자 |
| authCode | 인증코드 | String | 16 | Y | 0000(숫자4 형식) |

> **참고**: 이 API들은 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

---

## 🎉 **SSAFY API 연동 문서 완성!**

### 📊 **전체 API 요약 (총 50개)**

#### 🔑 **관리자 API** (2개 - userKey 불필요):
1-2. **API KEY 발급/재발급** (`MANAGER_01/02`)

#### 👤 **사용자 계정 API** (2개 - userKey 불필요):
3-4. **사용자 계정 생성/조회** (`MEMBER_01/02`)

#### 🏦 **은행/상품 API** (4개 - userKey 불필요):
5-8. **은행코드, 통화코드, 수시입출금 상품등록/조회** (`Bank01`, `CURRENCY_01`, `DEMAND_DEPOSIT_01/02`)

#### 💳 **수시입출금 계좌 API** (12개 - userKey 필요):
9-20. **계좌 생성~해지, 거래, 이체, 한도변경, 거래내역** (`DEMAND_DEPOSIT_03~14`)

#### 💰 **예금 상품/계좌 API** (9개):
21-29. **예금상품등록~계좌해지** (`DEPOSIT_01~09`)

#### 📈 **적금 상품/계좌 API** (9개):
30-38. **적금상품등록~계좌해지** (`SAVINGS_01~09`)

#### 🏠 **대출 상품/심사/계좌 API** (10개):
39-48. **신용등급기준조회~대출일시납상환** (`LOAN_01~10`)

#### 🔐 **계좌 인증 API** (2개):
49-50. **1원송금, 1원송금검증** (`ACCOUNT_AUTH_01/02`)

### 🎯 **Campus Credo 앱 연동 핵심 API**:
- **MEMBER_02**: 학생 이메일 검증 ✅
- **DEMAND_DEPOSIT_07**: 계좌 잔액 조회 ✅
- **DEMAND_DEPOSIT_12**: 거래내역 조회 → 크로니클 피드 ✅
- **DEPOSIT/SAVINGS**: 예적금 상품 → 금융 퀘스트 ✅
- **LOAN_04**: 내 신용등급 조회 → 개인 신용 점수 ✅
- **LOAN_09**: 대출 상환 내역 → 크로니클 피드 ✅
- **ACCOUNT_AUTH**: 계좌 인증 → 보안 강화 ✅

### 51. 거래내역 메모
**인터페이스 ID**: `TRANSACTION_MEMO_01`  
**인터페이스명**: 거래내역 메모

```
Method: POST
URL: https://finopenapi.ssafy.io/ssafy/api/v1/edu/transactionMemo
```

#### 요청 본문
```json
{
  "Header": {
    "apiName": "transactionMemo",
    "transmissionDate": "20240723",
    "transmissionTime": "152545",
    "institutionCode": "00100",
    "fintechAppNo": "001",
    "apiServiceCode": "transactionMemo",
    "institutionTransactionUniqueNo": "20240723152545874018",
    "apiKey": "e8fb2ac291804bc98834ff7bcef7e340",
    "userKey": "633d65a0-67c4-48b2-9bbf-94b948d8e141"
  },
  "accountNo": "0011214764051239",
  "transactionUniqueNo": "6",
  "transactionMemo": "적금 만기"
}
```

#### 요청 파라미터 설명
| Parameter명 | 설명 | 타입 | 길이 | 필수여부 | 비고 |
|-------------|------|------|------|----------|------|
| Header | 공통 헤더 | Object | - | Y | userKey 포함 |
| accountNo | 계좌번호 | String | 16 | Y | |
| transactionUniqueNo | 거래고유번호 | Long | - | Y | |
| transactionMemo | 메모 | String | 255 | N | |

> **참고**: 이 API는 공통 헤더에 `userKey`를 **포함**하여 사용합니다.

---

## 🎉 **SSAFY API 연동 문서 완성!**

### 📊 **전체 API 요약 (총 51개)**

#### 🔑 **관리자 API** (2개 - userKey 불필요):
1-2. **API KEY 발급/재발급** (`MANAGER_01/02`)

#### 👤 **사용자 계정 API** (2개 - userKey 불필요):
3-4. **사용자 계정 생성/조회** (`MEMBER_01/02`)

#### 🏦 **은행/상품 API** (4개 - userKey 불필요):
5-8. **은행코드, 통화코드, 수시입출금 상품등록/조회** (`Bank01`, `CURRENCY_01`, `DEMAND_DEPOSIT_01/02`)

#### 💳 **수시입출금 계좌 API** (12개 - userKey 필요):
9-20. **계좌 생성~해지, 거래, 이체, 한도변경, 거래내역** (`DEMAND_DEPOSIT_03~14`)

#### 💰 **예금 상품/계좌 API** (9개):
21-29. **예금상품등록~계좌해지** (`DEPOSIT_01~09`)

#### 📈 **적금 상품/계좌 API** (9개):
30-38. **적금상품등록~계좌해지** (`SAVINGS_01~09`)

#### 🏠 **대출 상품/심사/계좌 API** (10개):
39-48. **신용등급기준조회~대출일시납상환** (`LOAN_01~10`)

#### 🔐 **계좌 인증 API** (2개):
49-50. **1원송금, 1원송금검증** (`ACCOUNT_AUTH_01/02`)

#### 📝 **거래 메모 API** (1개):
51. **거래내역 메모** (`TRANSACTION_MEMO_01`)

### 🎯 **Campus Credo 앱 연동 핵심 API**:
- **MEMBER_02**: 학생 이메일 검증 ✅
- **DEMAND_DEPOSIT_07**: 계좌 잔액 조회 ✅
- **DEMAND_DEPOSIT_12**: 거래내역 조회 → 크로니클 피드 ✅
- **DEPOSIT/SAVINGS**: 예적금 상품 → 금융 퀘스트 ✅
- **LOAN_04**: 내 신용등급 조회 → 개인 신용 점수 ✅
- **LOAN_09**: 대출 상환 내역 → 크로니클 피드 ✅
- **ACCOUNT_AUTH**: 계좌 인증 → 보안 강화 ✅
- **TRANSACTION_MEMO_01**: 거래내역 메모 → 개인화 ✅

---

## 📋 **SSAFY API 워크플로우 분석**

### 🔐 **1원 인증 및 거래내역메모 워크플로우**

#### **1원 인증 프로세스**:
```
1원 송금 → 계좌 거래내역 조회(인증코드 확인) → 1원 송금 검증
```

**주요 특징**:
- **인증코드는 숫자 4자리가 랜덤 생성**됩니다
- 기업명은 앱 식별을 위해 앱 관리자가 입력합니다
- 인증코드는 수시입출금의 계좌 거래내역 조회에서 확인할 수 있습니다

**관련 API**:
- `ACCOUNT_AUTH_01`: 1원 송금 
- `DEMAND_DEPOSIT_12`: 계좌거래내역조회 (인증코드 확인용)
- `ACCOUNT_AUTH_02`: 1원 송금 검증

#### **거래내역 메모 프로세스**:
```
거래고유번호 확인 → 거래내역 메모
```

**주요 특징**:
- 거래내역 메모는 거래고유번호를 통해 입력 및 수정 가능합니다
- 입금, 출금, 이체 등 거래 시 생성되는 거래고유번호 또는 계좌거래내역조회의 거래고유번호를 확인하여 해당 거래건에 대해 메모를 입력 또는 수정할 수 있습니다

**관련 API**:
- `TRANSACTION_MEMO_01`: 거래내역 메모

---

### 💰 **적금 워크플로우**

#### **적금 상품 등록 프로세스** (교육생/앱 관리자):
```
은행코드 조회 → 적금상품등록 → 적금상품조회 → 적금계좌생성 → 적금계좌목록조회 → 적금만기이자조회
                    교육생(앱 관리자)                                      ↓
                                                                적금계좌조회(단건) → 적금중도해지이자조회
                                                                     ↓              ↓
                                                                적금납입상세조회 → 적금계좌해지
```

**상품등록시 참고사항**:
- 사용자에게 적금 상품 목록을 보여주기 위해 교육생(개발 앱)은 **적금 상품 등록 API**를 통해 적금 상품을 생성해야 합니다
- 등록된 조회 후 은행별 적금 상품을 등록합니다
- 적금 상품 조회 API를 통해 샘플 데이터를 참고하여 상품을 등록할 수 있습니다
- **가입기간(일 단위)**: 2일~365일 이내 입력 가능
- **최소/최대 가입 금액**: 1원~1백만원 이내 입력 가능
- **이자율(연이율, 가입기간에 따른 일단위 이자 지급)**: 0.1%~20% 이내 입력 가능 (소수점 가능)

**적금 이자 관련**:
- **적금 스케줄링**: 만기이자 지급: 만기 해당 날짜 기준 오전 07:00 연결 계좌로(수시입출금) 자동 지급되며 적금 계좌는 해지됩니다. 자동 이체: 가입기간 다음날부터 만기일까지 오전 06:30 연결 계좌에서(수시입출금) 자동 출금됩니다. (수시입출금 계좌의 잔액이 부족하여 납입되지 않을 시 납입 상태가 FAIL이며 해당 일의 이자는 지급되지 않습니다.)
- **이자 산출식**: 가입기간 회차별로 산정하여 (((원금 * (이자율 / 100)) / 365) * 일수) 반올림하여 이자 지급
- **중도해지 이자조회 및 적금 계좌 해지 시 이자 지급 방법**: 중도해지 요청일시 이자 금액을 계산합니다. (일 단위 이자 지급). 적금 계좌 해지 시 중도해지이자와 함께 연결 계좌로(수시입출금) 지급되며 적금 계좌는 해지됩니다.

---

### 🏠 **대출 워크플로우**

#### **대출 상품 등록 프로세스** (교육생/앱 관리자):
```
신용등급 기준 조회 → 은행코드 조회 → 대출상품등록 → 대출상품조회/ → 대출심사신청 → 대출심사목록조회
교육생(앱 관리자)    교육생(앱 관리자)   교육생(앱 관리자)   대신용등급조회            ↓
                                                                     대출상품가입목록조회 → 대출상품가입
                                                                     대출상환내역조회
                                                                     대출일시납상환
```

**상품등록시 참고사항**:
- 사용자에게 대출 상품 목록을 보여주기 위해 교육생(개발 앱)은 **대출 상품 등록 API**를 통해 대출 상품을 생성해야 합니다
- 신용등급에 맞는 대출 상품을 설정하기 위해 신용등급 기준조회 API를 호출합니다
- 은행코드 조회 후 은행별 대출 상품을 등록합니다
- 대출 상품 조회 API를 통해 샘플 데이터를 참고하여 상품을 등록할 수 있습니다
- **대출 기간(일 단위)**: 2일~365일 이내 입력 가능
- **최소/최대 대출 금액**: 1천원~3억원 이내 입력 가능
- **이자율(연이율, 가입기간에 따른 일단위 이자 지급)**: 0.1%~20% 이내 입력 가능 (소수점 가능)

**대출 이자 및 참고사항**:
- **대출 이자 스케줄링**: 대출금 이자 = 매일 ((대출금+이자) / 대출기간)으로 계산되어 오전 08:30에 대출 상품 기입시 기입한 수시입출금 계좌에서 상환됩니다. 상환이 완료되면 대출 계좌는 자동 해지되며, 한번이라도 연체 상태가 있다면 연체금을 납입할 때 까지 계좌는 유지됩니다.
- **대출 상품 가입 시**: 대출 상품 신용등급과 사용자의 신용등급을 비교하여 대출심사 신청 후 심사 상태가 승인인 것 목록에 한해 대출 상품 가입이 가능합니다.

---

### 💳 **수시입출금 워크플로우**

#### **수시입출금 상품/계좌 관리 프로세스**:
```
은행코드 조회 → 수시입출금 → 수시입출금 → 수시입출금 → 계좌 목록 조회 → 계좌 입금
교육생(앱 관리자)   상품 등록     상품 조회    계좌 생성              ↓
                교육생(앱 관리자)                            계좌 조회(단건) → 계좌 이체
                                                           ↓
                                                        예금주 조회 → 이체 한도 변경
                                                           ↓
                                                        계좌 잔액 → 계좌 거래내역 조회
                                                           ↓         ↓
                                                        계좌 해지 ← 계좌 거래 내역 조회(단건)
```

**상품등록시 참고사항**:
- 사용자에게 수시입출금 상품 목록을 보여주기 위해 교육생(개발 앱)은 **수시입출금 상품 등록 API**를 통해 수시입출금 상품을 생성해야합니다
- 은행코드 조회 후 은행별 수시입출금 상품을 등록합니다
- 수시입출금 상품 조회 API를 통해 샘플 데이터를 참고하여 상품을 등록할 수 있습니다

**기타 참고사항**:
- 예금, 적금, 대출 계좌와 카드를 생성하기 위해서는 수시입출금 계좌가 (연결계좌) 존재해야합니다
- 예금, 적금, 대출 계좌와 카드에 연결된 수시입출금 계좌는 (연결계좌) 해지할 수 없습니다

---

### 🏛️ **예금 워크플로우**

#### **예금 상품 등록 프로세스** (교육생/앱 관리자):
```
은행코드 조회 → 예금상품등록 → 예금상품조회 → 예금계좌생성 → 예금계좌목록조회 → 예금만기이자조회
교육생(앱 관리자)   교육생(앱 관리자)                            ↓
                                                    예금계좌조회(단건) → 예금중도해지이자조회
                                                         ↓              ↓
                                                    예금납입상세조회 → 예금계좌해지
```

**상품등록시 참고사항**:
- 사용자에게 예금 상품 목록을 보여주기 위해 교육생(개발 앱)은 **예금 상품 등록 API**를 통해 예금 상품을 생성해야합니다
- 은행코드 조회 후 은행별 예금 상품을 등록합니다  
- 예금 상품 조회 API를 통해 샘플 데이터를 참고하여 상품을 등록할 수 있습니다
- **가입기간(일 단위)**: 2일~365일 이내 입력 가능
- **최소/최대 가입 금액**: 1원~1억원 이내 입력 가능
- **이자율(연이율, 가입기간에 따른 일단위 이자 지급)**: 0.1%~20% 이내 입력 가능 (소수점 가능)

**예금 이자 관련**:
- **예금 이자 스케줄링**: 만기이자 지급: 만기 해당 날짜 기준 오전 07:00 연결 계좌로(수시입출금) 자동 지급됩니다
- **이자 산출식**: (((원금 * (이자율 / 100)) / 365) * 일수) 반올림하여 이자 지급
- **중도해지 이자조회 및 예금 계좌 해지 시 이자 지급 방법**: 중도해지 요청일시 이자 금액을 계산합니다. (일 단위 이자 지급). 예금 계좌 해지 시 중도해지이자와 함께 연결 계좌로(수시입출금) 지급되며 예금 계좌는 해지됩니다.

---

**이제 실제 SSAFY API 연동 구현을 시작할 준비가 완료되었습니다!** 🚀

#### 성공 응답
**TODO: 실제 응답 형식 입력**

```json
{
  "success": true,
  "data": {
    "student_name": "김SSAFY",
    "university": "SSAFY 대학교",
    "student_id": "SSAFY001",
    "email": "student@ssafy.com",
    "department": "소프트웨어개발",
    "grade": 1
  }
}
```

#### 실패 응답
**TODO: 실제 오류 응답 형식 입력**

```json
{
  "success": false,
  "error": {
    "code": "STUDENT_NOT_FOUND",
    "message": "해당 이메일의 학생 정보를 찾을 수 없습니다."
  }
}
```

### 2. 대학교 목록 조회 (선택사항)
**TODO: 필요시 추가 엔드포인트 정보 입력**

```
Method: [GET/POST]
URL: https://api.ssafy.com/[실제경로]
```

## 📝 구현 예제

### Python (백엔드) 예제
```python
import requests

def verify_ssafy_student(email: str, api_key: str):
    """
    SSAFY API를 사용한 학생 이메일 검증
    """
    # TODO: 실제 구현 예제 작성
    url = "https://api.ssafy.com/[실제경로]"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"  # 또는 다른 인증 방식
    }
    payload = {
        "email": email
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        if data.get("success"):
            return {
                "is_valid": True,
                "student_info": data.get("data", {})
            }
        else:
            return {
                "is_valid": False,
                "error": data.get("error", {})
            }
            
    except requests.RequestException as e:
        return {
            "is_valid": False,
            "error": {"message": f"API 호출 실패: {str(e)}"}
        }
```

### JavaScript (프론트엔드) 예제
```javascript
async function verifySsafyStudent(email) {
  // TODO: 실제 구현 예제 작성
  try {
    const response = await fetch('http://localhost:8000/api/auth/verify-ssafy-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok && data.is_valid_student) {
      return {
        success: true,
        studentInfo: {
          name: data.student_name,
          university: data.university,
          studentId: data.student_id
        }
      };
    } else {
      return {
        success: false,
        message: data.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '네트워크 오류가 발생했습니다.'
    };
  }
}
```

## 🛠️ 트러블슈팅

### 자주 발생하는 오류
**TODO: 실제 사용 중 발생할 수 있는 오류들 정리**

1. **인증 오류**
   - 원인: API 키가 잘못되었거나 만료됨
   - 해결: API 키 확인 및 갱신

2. **학생 정보 없음**
   - 원인: 해당 이메일이 SSAFY 학생 DB에 없음
   - 해결: 이메일 확인 또는 관리자 문의

3. **API 호출 제한**
   - 원인: 요청 횟수 제한 초과
   - 해결: 캐싱 또는 요청 간격 조절

### API 테스트 방법
**TODO: API 테스트 도구나 방법 설명**

```bash
# curl 예제
curl -X POST "https://api.ssafy.com/[실제경로]" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1924d3d047eb472ab5a81df01977485c" \
  -d '{"email": "test@ssafy.com"}'
```

## 📚 참고 자료
**TODO: 공식 문서나 추가 자료 링크**

- [SSAFY API 공식 문서]()
- [API 키 발급 방법]()
- [개발자 포털]()

## 🔄 업데이트 로그
- **2025-08-27**: 초기 문서 작성
- **TODO**: 실제 API 정보로 업데이트 예정

---

**📝 작성 완료 후 할 일:**
1. [ ] 실제 API 엔드포인트 URL 입력
2. [ ] 요청/응답 형식 확인
3. [ ] 인증 방식 확인
4. [ ] 오류 코드 정리
5. [ ] 테스트 및 검증
6. [ ] 백엔드 코드 업데이트
