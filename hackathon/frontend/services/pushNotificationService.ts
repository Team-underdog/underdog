/**
 * 푸시 알림 서비스
 * 거래 발생 시 실시간 알림 및 금융 관련 알림 제공
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'default' | 'normal' | 'high';
}

export interface TransactionNotification {
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'interest';
  amount: number;
  accountName: string;
  memo?: string;
  timestamp: string;
}

export interface FinancialAlert {
  type: 'low_balance' | 'high_spending' | 'goal_achieved' | 'payment_due' | 'interest_earned';
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * 서비스 초기화
   */
  async initialize(): Promise<void> {
    try {
      // 알림 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('푸시 알림 권한이 거부되었습니다.');
        return;
      }

      // Expo 푸시 토큰 가져오기
      if (Device.isDevice) {
        this.expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo 푸시 토큰:', this.expoPushToken);
      }

      // 알림 설정 구성
      await this.configureNotifications();
      
      // 알림 리스너 설정
      this.setupNotificationListeners();
      
    } catch (error) {
      console.error('푸시 알림 서비스 초기화 실패:', error);
    }
  }

  /**
   * 알림 설정 구성
   */
  private async configureNotifications(): Promise<void> {
    // 알림 동작 설정
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 알림 채널 설정 (Android)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // 금융 알림 전용 채널
      await Notifications.setNotificationChannelAsync('financial', {
        name: 'financial',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#4CAF50',
        sound: 'default',
      });
    }
  }

  /**
   * 알림 리스너 설정
   */
  private setupNotificationListeners(): void {
    // 알림 수신 시
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('알림 수신:', notification);
      this.handleNotificationReceived(notification);
    });

    // 알림 탭 시
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('알림 응답:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * 알림 수신 처리
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    // 알림 데이터에 따른 처리
    const data = notification.request.content.data;
    
    if (data?.type === 'transaction') {
      // 거래 알림 처리
      this.handleTransactionNotification(data);
    } else if (data?.type === 'financial_alert') {
      // 금융 알림 처리
      this.handleFinancialAlert(data);
    }
  }

  /**
   * 알림 응답 처리
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    // 알림 탭 시 앱 내 특정 화면으로 이동
    if (data?.screen) {
      // 네비게이션 처리 (React Navigation 등과 연동)
      console.log('화면 이동:', data.screen);
    }
  }

  /**
   * 거래 알림 처리
   */
  private handleTransactionNotification(data: any): void {
    // 거래 알림에 따른 앱 내 상태 업데이트
    console.log('거래 알림 처리:', data);
  }

  /**
   * 금융 알림 처리
   */
  private handleFinancialAlert(data: any): void {
    // 금융 알림에 따른 앱 내 상태 업데이트
    console.log('금융 알림 처리:', data);
  }

  /**
   * 거래 알림 전송
   */
  async sendTransactionNotification(transaction: TransactionNotification): Promise<void> {
    try {
      const notification: NotificationData = {
        title: this.getTransactionNotificationTitle(transaction.type),
        body: this.getTransactionNotificationBody(transaction),
        data: {
          type: 'transaction',
          transaction,
          screen: 'TransactionDetail',
        },
        sound: true,
        priority: 'high',
      };

      await this.sendLocalNotification(notification);
      
      // 서버로 푸시 알림 전송 (선택사항)
      if (this.expoPushToken) {
        await this.sendPushToServer(notification);
      }
      
    } catch (error) {
      console.error('거래 알림 전송 실패:', error);
    }
  }

  /**
   * 금융 알림 전송
   */
  async sendFinancialAlert(alert: FinancialAlert): Promise<void> {
    try {
      const notification: NotificationData = {
        title: this.getFinancialAlertTitle(alert.type),
        body: alert.message,
        data: {
          type: 'financial_alert',
          alert,
          screen: 'FinancialDashboard',
        },
        sound: true,
        priority: alert.priority === 'high' ? 'high' : 'normal',
      };

      await this.sendLocalNotification(notification);
      
    } catch (error) {
      console.error('금융 알림 전송 실패:', error);
    }
  }

  /**
   * 로컬 알림 전송
   */
  private async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      const channelId = notification.data?.type === 'financial_alert' ? 'financial' : 'default';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound,
          priority: notification.priority,
        },
        trigger: null, // 즉시 전송
      });
      
    } catch (error) {
      console.error('로컬 알림 전송 실패:', error);
    }
  }

  /**
   * 서버로 푸시 알림 전송
   */
  private async sendPushToServer(notification: NotificationData): Promise<void> {
    try {
      // 백엔드 서버로 푸시 알림 전송
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.expoPushToken,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: notification.sound ? 'default' : undefined,
          priority: notification.priority,
        }),
      });

      if (!response.ok) {
        throw new Error(`푸시 전송 실패: ${response.status}`);
      }

      console.log('서버 푸시 알림 전송 성공');
      
    } catch (error) {
      console.error('서버 푸시 알림 전송 실패:', error);
    }
  }

  /**
   * 거래 알림 제목 생성
   */
  private getTransactionNotificationTitle(type: string): string {
    switch (type) {
      case 'deposit':
        return '💰 입금 완료';
      case 'withdrawal':
        return '💸 출금 완료';
      case 'transfer':
        return '🔄 이체 완료';
      case 'payment':
        return '💳 결제 완료';
      case 'interest':
        return '📈 이자 지급';
      default:
        return '💳 거래 완료';
    }
  }

  /**
   * 거래 알림 내용 생성
   */
  private getTransactionNotificationBody(transaction: TransactionNotification): string {
    const amount = Math.abs(transaction.amount).toLocaleString();
    const accountName = transaction.accountName;
    
    switch (transaction.type) {
      case 'deposit':
        return `${accountName}에 ${amount}원이 입금되었습니다.`;
      case 'withdrawal':
        return `${accountName}에서 ${amount}원이 출금되었습니다.`;
      case 'transfer':
        return `${accountName}로 ${amount}원이 이체되었습니다.`;
      case 'payment':
        return `${accountName}에서 ${amount}원 결제가 완료되었습니다.`;
      case 'interest':
        return `${accountName}에 ${amount}원 이자가 지급되었습니다.`;
      default:
        return `${accountName}에서 거래가 발생했습니다.`;
    }
  }

  /**
   * 금융 알림 제목 생성
   */
  private getFinancialAlertTitle(type: string): string {
    switch (type) {
      case 'low_balance':
        return '⚠️ 잔액 부족';
      case 'high_spending':
        return '💸 지출 과다';
      case 'goal_achieved':
        return '🎯 목표 달성';
      case 'payment_due':
        return '📅 결제 예정';
      case 'interest_earned':
        return '📈 이자 획득';
      default:
        return '💡 금융 알림';
    }
  }

  /**
   * 정기 알림 스케줄링
   */
  async scheduleRecurringNotifications(): Promise<void> {
    try {
      // 월별 재무 리포트 알림 (매월 1일 오전 9시)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 월간 재무 리포트',
          body: '이번 달 재무 현황을 확인해보세요!',
          data: { screen: 'FinancialReport' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          day: 1,
          repeats: true,
        },
      });

      // 주간 지출 요약 알림 (매주 일요일 오후 6시)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📈 주간 지출 요약',
          body: '이번 주 지출 현황을 점검해보세요!',
          data: { screen: 'WeeklySummary' },
        },
        trigger: {
          hour: 18,
          minute: 0,
          weekday: 1, // 일요일
          repeats: true,
        },
      });

      console.log('정기 알림 스케줄링 완료');
      
    } catch (error) {
      console.error('정기 알림 스케줄링 실패:', error);
    }
  }

  /**
   * 알림 배지 초기화
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('배지 초기화 실패:', error);
    }
  }

  /**
   * 서비스 정리
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Expo 푸시 토큰 반환
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default new PushNotificationService();
