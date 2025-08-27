/**
 * 금액을 1원 단위로 표시하는 유틸리티 함수들
 */

/**
 * 숫자를 한국 원화 형식으로 포맷팅 (1원 단위)
 * @param amount 금액 (1원 단위)
 * @returns 포맷팅된 문자열 (예: "1,234,567원")
 */
export const formatKRW = (amount: number): string => {
  return `${amount.toLocaleString()}원`;
};

/**
 * 숫자를 한국 원화 형식으로 포맷팅 (천 단위 구분자만)
 * @param amount 금액 (1원 단위)
 * @returns 포맷팅된 문자열 (예: "1,234,567")
 */
export const formatKRWNumber = (amount: number): string => {
  return amount.toLocaleString();
};

/**
 * 숫자를 한국 원화 형식으로 포맷팅 (단위 표시)
 * @param amount 금액 (1원 단위)
 * @returns 포맷팅된 문자열 (예: "123.5만원", "1.2억원")
 */
export const formatKRWWithUnit = (amount: number): string => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}만원`;
  } else {
    return `${amount}원`;
  }
};

/**
 * 숫자를 한국 원화 형식으로 포맷팅 (컴팩트)
 * @param amount 금액 (1원 단위)
 * @returns 포맷팅된 문자열 (예: "123.5만", "1.2억")
 */
export const formatKRWCompact = (amount: number): string => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}만`;
  } else {
    return `${amount}`;
  }
};

/**
 * 금액을 색상과 함께 표시 (양수/음수에 따라)
 * @param amount 금액 (1원 단위)
 * @param showSign 부호 표시 여부
 * @returns 포맷팅된 문자열
 */
export const formatKRWWithColor = (amount: number, showSign: boolean = false): string => {
  const sign = showSign && amount > 0 ? '+' : '';
  return `${sign}${formatKRW(amount)}`;
};
