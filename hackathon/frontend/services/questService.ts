/**
 * 퀘스트 시스템 서비스
 * 실제 금융 데이터와 연동하여 퀘스트 진행 상황을 추적
 */

import { financialService, type FinancialSummary, type Transaction } from './financialService';

// 퀘스트 타입 정의
export interface QuestProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'academic' | 'lifestyle' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  reward: {
    credo: number;
    xp: number;
    skillName: string;
  };
  progress: QuestProgress;
  isCompleted: boolean;
  isActive: boolean;
  deadline?: string;
  trackingType: 'transaction_count' | 'amount_threshold' | 'balance_target' | 'savings_goal' | 'spending_limit';
  trackingParams: Record<string, any>;
}

class QuestService {
  /**
   * 사용자 금융 데이터를 기반으로 개인화된 퀘스트 생성
   */
  generatePersonalizedQuests(financialData: FinancialSummary, userTransactions: Transaction[]): Quest[] {
    const quests: Quest[] = [];
    
    // 1. 저축 관련 퀘스트
    const currentBalance = financialData.total_balance;
    const savingsTarget = Math.ceil(currentBalance * 1.1 / 100000) * 100000; // 10% 증가 목표
    
    quests.push({
      id: 'savings_goal_1',
      title: '저축 마스터',
      description: `잔액을 ${savingsTarget.toLocaleString()}원까지 늘려보세요`,
      category: 'financial',
      difficulty: 'medium',
      reward: {
        credo: 100,
        xp: 200,
        skillName: '재무관리'
      },
      progress: {
        current: currentBalance,
        target: savingsTarget,
        percentage: Math.min((currentBalance / savingsTarget) * 100, 100)
      },
      isCompleted: currentBalance >= savingsTarget,
      isActive: !!(currentBalance < savingsTarget),
      trackingType: 'balance_target',
      trackingParams: { target: savingsTarget }
    });

    // 2. 지출 관리 퀘스트
    const spendingLimit = Math.floor(financialData.monthly_income * 0.7); // 수입의 70% 이하 지출
    
    quests.push({
      id: 'spending_control_1',
      title: '지출 관리 달인',
      description: `이번 달 지출을 ${spendingLimit.toLocaleString()}원 이하로 관리하세요`,
      category: 'financial',
      difficulty: 'hard',
      reward: {
        credo: 150,
        xp: 300,
        skillName: '재무관리'
      },
      progress: {
        current: financialData.monthly_spending,
        target: spendingLimit,
        percentage: Math.min((financialData.monthly_spending / spendingLimit) * 100, 100)
      },
      isCompleted: financialData.monthly_spending <= spendingLimit,
      isActive: !!(financialData.monthly_spending > spendingLimit),
      trackingType: 'spending_limit',
      trackingParams: { limit: spendingLimit }
    });

    // 3. 거래 빈도 퀘스트
    const recentTransactionCount = userTransactions.length;
    const transactionTarget = 10; // 최근 30일 내 10건 거래
    
    quests.push({
      id: 'transaction_activity_1',
      title: '적극적인 금융 활동',
      description: `최근 30일 동안 ${transactionTarget}건 이상 거래하기`,
      category: 'financial',
      difficulty: 'easy',
      reward: {
        credo: 50,
        xp: 100,
        skillName: '재무관리'
      },
      progress: {
        current: recentTransactionCount,
        target: transactionTarget,
        percentage: Math.min((recentTransactionCount / transactionTarget) * 100, 100)
      },
      isCompleted: recentTransactionCount >= transactionTarget,
      isActive: !!(recentTransactionCount < transactionTarget),
      trackingType: 'transaction_count',
      trackingParams: { target: transactionTarget, period: 30 }
    });

    // 4. 적금 퀘스트 (적금 계좌가 있는 경우)
    if (financialData.savings_accounts.length > 0) {
      const savingsAccount = financialData.savings_accounts[0];
      const maturityAmount = savingsAccount.balance * 1.2; // 20% 증가 목표
      
      quests.push({
        id: 'savings_growth_1',
        title: '적금 달성 챌린지',
        description: `${savingsAccount.product_name} 잔액을 ${maturityAmount.toLocaleString()}원까지 늘리세요`,
        category: 'financial',
        difficulty: 'medium',
        reward: {
          credo: 200,
          xp: 400,
          skillName: '재무관리'
        },
        progress: {
          current: savingsAccount.balance,
          target: maturityAmount,
          percentage: Math.min((savingsAccount.balance / maturityAmount) * 100, 100)
        },
        isCompleted: savingsAccount.balance >= maturityAmount,
        isActive: !!(savingsAccount.balance < maturityAmount),
        trackingType: 'savings_goal',
        trackingParams: { 
          accountNo: savingsAccount.account_no,
          target: maturityAmount 
        }
      });
    }

    // 5. 신용등급 유지 퀘스트
    quests.push({
      id: 'credit_maintain_1',
      title: '신용 등급 지키기',
      description: `신용등급 '${financialData.credit_grade}' 이상 유지하기`,
      category: 'financial',
      difficulty: 'easy',
      reward: {
        credo: 75,
        xp: 150,
        skillName: '재무관리'
      },
      progress: {
        current: financialData.credit_score,
        target: financialData.credit_score,
        percentage: 100 // 현재 등급 유지가 목표
      },
      isCompleted: true, // 현재 유지 중
      isActive: true,
      trackingType: 'amount_threshold',
      trackingParams: { 
        minCreditScore: financialData.credit_score - 50 // 50점 이하로 떨어지면 실패
      }
    });

    // 6. 학업 관련 퀘스트 (금융 데이터와 무관하지만 포함)
    quests.push({
      id: 'academic_coding_1',
      title: '코딩 실력 향상',
      description: '백준 온라인 저지에서 알고리즘 문제 5개 풀기',
      category: 'academic',
      difficulty: 'medium',
      reward: {
        credo: 100,
        xp: 200,
        skillName: '학업'
      },
      progress: {
        current: 0, // 외부 시스템과 연동 필요
        target: 5,
        percentage: 0
      },
      isCompleted: false,
      isActive: true,
      trackingType: 'transaction_count', // 임시
      trackingParams: { target: 5 }
    });

    return quests;
  }

  /**
   * 거래내역을 분석하여 퀘스트 진행 상황 업데이트
   */
  updateQuestProgress(quests: Quest[], transactions: Transaction[], financialData: FinancialSummary): Quest[] {
    return quests.map(quest => {
      let updatedQuest = { ...quest };

      switch (quest.trackingType) {
        case 'balance_target':
          updatedQuest.progress = {
            current: financialData.total_balance,
            target: quest.trackingParams.target,
            percentage: Math.min((financialData.total_balance / quest.trackingParams.target) * 100, 100)
          };
          updatedQuest.isCompleted = financialData.total_balance >= quest.trackingParams.target;
          break;

        case 'spending_limit':
          updatedQuest.progress = {
            current: financialData.monthly_spending,
            target: quest.trackingParams.limit,
            percentage: Math.min((financialData.monthly_spending / quest.trackingParams.limit) * 100, 100)
          };
          updatedQuest.isCompleted = financialData.monthly_spending <= quest.trackingParams.limit;
          break;

        case 'transaction_count':
          const transactionCount = transactions.length;
          updatedQuest.progress = {
            current: transactionCount,
            target: quest.trackingParams.target,
            percentage: Math.min((transactionCount / quest.trackingParams.target) * 100, 100)
          };
          updatedQuest.isCompleted = transactionCount >= quest.trackingParams.target;
          break;

        case 'savings_goal':
          const savingsAccount = financialData.savings_accounts.find(
            acc => acc.account_no === quest.trackingParams.accountNo
          );
          if (savingsAccount) {
            updatedQuest.progress = {
              current: savingsAccount.balance,
              target: quest.trackingParams.target,
              percentage: Math.min((savingsAccount.balance / quest.trackingParams.target) * 100, 100)
            };
            updatedQuest.isCompleted = savingsAccount.balance >= quest.trackingParams.target;
          }
          break;

        case 'amount_threshold':
          // 신용등급 관련 퀘스트
          if (quest.trackingParams.minCreditScore) {
            updatedQuest.isCompleted = financialData.credit_score >= quest.trackingParams.minCreditScore;
            updatedQuest.progress.percentage = updatedQuest.isCompleted ? 100 : 50;
          }
          break;
      }

      return updatedQuest;
    });
  }

  /**
   * 퀘스트 완료 시 보상 지급
   */
  claimQuestReward(quest: Quest): { success: boolean; message: string } {
    if (!quest.isCompleted) {
      return {
        success: false,
        message: '퀘스트가 아직 완료되지 않았습니다.'
      };
    }

    // 실제로는 백엔드 API 호출하여 보상 지급
    console.log(`🎉 퀘스트 완료! ${quest.title}`);
    console.log(`💰 획득 보상: ${quest.reward.credo} Credo, ${quest.reward.xp} XP`);

    return {
      success: true,
      message: `${quest.reward.credo} Credo와 ${quest.reward.xp} XP를 획득했습니다!`
    };
  }

  /**
   * 거래내역에서 특정 패턴을 찾아 자동 퀘스트 제안
   */
  suggestQuestsFromTransactions(transactions: Transaction[]): Quest[] {
    const suggestions: Quest[] = [];

    // 카페 결제가 많은 경우
    const cafeTransactions = transactions.filter(t => 
      t.transactionSummary.includes('카페') || 
      t.transactionSummary.includes('커피')
    );

    if (cafeTransactions.length >= 3) {
      suggestions.push({
        id: 'cafe_limit_suggestion',
        title: '카페 지출 절약하기',
        description: '이번 달 카페 지출을 50,000원 이하로 관리해보세요',
        category: 'financial',
        difficulty: 'easy',
        reward: {
          credo: 75,
          xp: 150,
          skillName: '재무관리'
        },
        progress: {
          current: cafeTransactions.reduce((sum, t) => sum + t.transactionBalance, 0),
          target: 50000,
          percentage: 0
        },
        isCompleted: false,
        isActive: false, // 제안 상태
        trackingType: 'spending_limit',
        trackingParams: { 
          category: 'cafe',
          limit: 50000 
        }
      });
    }

    // 정기적인 저축 패턴이 없는 경우
    const savingsTransactions = transactions.filter(t => 
      t.transactionSummary.includes('적금') || 
      t.transactionSummary.includes('저축')
    );

    if (savingsTransactions.length === 0) {
      suggestions.push({
        id: 'start_savings_suggestion',
        title: '저축 습관 만들기',
        description: '매주 10만원씩 적금 넣기 시작해보세요',
        category: 'financial',
        difficulty: 'medium',
        reward: {
          credo: 100,
          xp: 200,
          skillName: '재무관리'
        },
        progress: {
          current: 0,
          target: 4, // 4주
          percentage: 0
        },
        isCompleted: false,
        isActive: false,
        trackingType: 'transaction_count',
        trackingParams: { 
          target: 4,
          amount: 100000,
          period: 'weekly'
        }
      });
    }

    return suggestions;
  }

  /**
   * 난이도별 퀘스트 분류
   */
  categorizeQuestsByDifficulty(quests: Quest[]): Record<string, Quest[]> {
    return quests.reduce((categories, quest) => {
      if (!categories[quest.difficulty]) {
        categories[quest.difficulty] = [];
      }
      categories[quest.difficulty].push(quest);
      return categories;
    }, {} as Record<string, Quest[]>);
  }

  /**
   * 활성 퀘스트만 필터링
   */
  getActiveQuests(quests: Quest[]): Quest[] {
    return quests.filter(quest => quest.isActive && !quest.isCompleted);
  }

  /**
   * 완료된 퀘스트만 필터링
   */
  getCompletedQuests(quests: Quest[]): Quest[] {
    return quests.filter(quest => quest.isCompleted);
  }
}

export const questService = new QuestService();
export default questService;
