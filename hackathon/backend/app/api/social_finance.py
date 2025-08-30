"""
소셜 금융 API
친구와의 송금, 분할 정산, 그룹 지출 관리 기능
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import random
import uuid

from ..services.ssafy_api_service import SSAFYAPIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/social", tags=["Social Finance"])

# SSAFY API 서비스 인스턴스
ssafy_service = SSAFYAPIService()

# 임시 데이터 저장 (실제로는 데이터베이스 사용)
friends_db = {}
transfers_db = {}
split_expenses_db = {}
group_expenses_db = {}
payment_reminders_db = {}

@router.get("/friends")
async def get_friends(user_id: str):
    """사용자의 친구 목록 조회"""
    try:
        print(f"👥 친구 목록 조회: {user_id}")
        
        # 임시 친구 데이터 생성 (실제로는 DB에서 조회)
        if user_id not in friends_db:
            friends_db[user_id] = [
                {
                    "id": "friend_001",
                    "name": "김친구",
                    "email": "friend1@ssafy.com",
                    "phone": "010-1234-5678",
                    "profileImage": None,
                    "isVerified": True,
                    "lastActive": (datetime.now() - timedelta(hours=2)).isoformat()
                },
                {
                    "id": "friend_002", 
                    "name": "이친구",
                    "email": "friend2@ssafy.com",
                    "phone": "010-2345-6789",
                    "profileImage": None,
                    "isVerified": True,
                    "lastActive": (datetime.now() - timedelta(minutes=30)).isoformat()
                },
                {
                    "id": "friend_003",
                    "name": "박친구", 
                    "email": "friend3@ssafy.com",
                    "phone": "010-3456-7890",
                    "profileImage": None,
                    "isVerified": False,
                    "lastActive": (datetime.now() - timedelta(days=1)).isoformat()
                }
            ]
        
        friends = friends_db[user_id]
        print(f"✅ 친구 목록 조회 완료: {len(friends)}명")
        
        return {
            "success": True,
            "friends": friends,
            "total_count": len(friends)
        }
        
    except Exception as e:
        logger.error(f"친구 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"친구 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/friends/search")
async def search_friends(user_id: str, keyword: str):
    """친구 검색"""
    try:
        print(f"🔍 친구 검색: {user_id}, 키워드: {keyword}")
        
        if user_id not in friends_db:
            return {"success": True, "friends": [], "total_count": 0}
        
        friends = friends_db[user_id]
        filtered_friends = [
            friend for friend in friends
            if keyword.lower() in friend["name"].lower() or 
               keyword.lower() in friend["email"].lower()
        ]
        
        print(f"✅ 친구 검색 완료: {len(filtered_friends)}명")
        
        return {
            "success": True,
            "friends": filtered_friends,
            "total_count": len(filtered_friends),
            "keyword": keyword
        }
        
    except Exception as e:
        logger.error(f"친구 검색 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"친구 검색 중 오류가 발생했습니다: {str(e)}")

@router.post("/friends/add")
async def add_friend(user_id: str, friend_email: str):
    """친구 추가"""
    try:
        print(f"➕ 친구 추가: {user_id} -> {friend_email}")
        
        # 새로운 친구 생성
        new_friend = {
            "id": f"friend_{uuid.uuid4().hex[:8]}",
            "name": friend_email.split("@")[0],  # 이메일에서 이름 추출
            "email": friend_email,
            "phone": None,
            "profileImage": None,
            "isVerified": False,
            "lastActive": datetime.now().isoformat()
        }
        
        if user_id not in friends_db:
            friends_db[user_id] = []
        
        friends_db[user_id].append(new_friend)
        
        print(f"✅ 친구 추가 완료: {new_friend['name']}")
        
        return {
            "success": True,
            "friend": new_friend,
            "message": "친구가 추가되었습니다."
        }
        
    except Exception as e:
        logger.error(f"친구 추가 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"친구 추가 중 오류가 발생했습니다: {str(e)}")

@router.post("/transfer")
async def request_transfer(
    from_user_id: str,
    to_user_id: str,
    amount: int,
    memo: str,
    account_no: str,
    transfer_type: str = "instant",
    scheduled_date: Optional[str] = None
):
    """송금 요청"""
    try:
        print(f"💸 송금 요청: {from_user_id} -> {to_user_id}, {amount:,}원")
        
        # 송금 수수료 계산
        fee = calculate_transfer_fee(amount, transfer_type)
        
        # 송금 내역 생성
        transfer_id = f"transfer_{uuid.uuid4().hex[:8]}"
        transfer = {
            "transferId": transfer_id,
            "fromUserId": from_user_id,
            "toUserId": to_user_id,
            "amount": amount,
            "fee": fee,
            "memo": memo,
            "accountNo": account_no,
            "transferType": transfer_type,
            "scheduledDate": scheduled_date,
            "status": "pending",
            "timestamp": datetime.now().isoformat(),
            "fromUser": {"id": from_user_id, "name": "송금자"},
            "toUser": {"id": to_user_id, "name": "수신자"}
        }
        
        transfers_db[transfer_id] = transfer
        
        # 즉시 송금인 경우 상태를 completed로 변경
        if transfer_type == "instant":
            transfer["status"] = "completed"
            
            # SSAFY API를 통한 실제 송금 처리 (시뮬레이션)
            try:
                # 출금 처리
                withdrawal_result = ssafy_service.withdraw_from_account(
                    account_no, amount, memo, from_user_id
                )
                
                if withdrawal_result.get('success'):
                    print(f"✅ 출금 처리 성공: {amount:,}원")
                else:
                    print(f"⚠️ 출금 처리 실패: {withdrawal_result.get('message')}")
                    
            except Exception as e:
                print(f"⚠️ SSAFY API 출금 처리 실패: {str(e)}")
        
        print(f"✅ 송금 요청 완료: {transfer_id}")
        
        return {
            "success": True,
            "transfer": transfer
        }
        
    except Exception as e:
        logger.error(f"송금 요청 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"송금 요청 중 오류가 발생했습니다: {str(e)}")

@router.get("/transfer/history")
async def get_transfer_history(user_id: str, limit: int = 20):
    """송금 내역 조회"""
    try:
        print(f"📋 송금 내역 조회: {user_id}, 제한: {limit}")
        
        user_transfers = []
        for transfer in transfers_db.values():
            if transfer["fromUserId"] == user_id or transfer["toUserId"] == user_id:
                user_transfers.append(transfer)
        
        # 최신순으로 정렬
        user_transfers.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # 제한된 개수만 반환
        limited_transfers = user_transfers[:limit]
        
        print(f"✅ 송금 내역 조회 완료: {len(limited_transfers)}건")
        
        return {
            "success": True,
            "transfers": limited_transfers,
            "total_count": len(user_transfers)
        }
        
    except Exception as e:
        logger.error(f"송금 내역 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"송금 내역 조회 중 오류가 발생했습니다: {str(e)}")

@router.post("/transfer/{transfer_id}/cancel")
async def cancel_transfer(transfer_id: str, user_id: str):
    """송금 취소"""
    try:
        print(f"❌ 송금 취소: {transfer_id}, 사용자: {user_id}")
        
        if transfer_id not in transfers_db:
            raise HTTPException(status_code=404, detail="송금 내역을 찾을 수 없습니다.")
        
        transfer = transfers_db[transfer_id]
        
        # 권한 확인
        if transfer["fromUserId"] != user_id:
            raise HTTPException(status_code=403, detail="송금을 취소할 권한이 없습니다.")
        
        # 상태 확인
        if transfer["status"] != "pending":
            raise HTTPException(status_code=400, detail="취소할 수 없는 송금 상태입니다.")
        
        # 송금 취소
        transfer["status"] = "cancelled"
        
        print(f"✅ 송금 취소 완료: {transfer_id}")
        
        return {
            "success": True,
            "message": "송금이 취소되었습니다.",
            "transfer": transfer
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"송금 취소 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"송금 취소 중 오류가 발생했습니다: {str(e)}")

@router.post("/split-expense")
async def create_split_expense(
    title: str,
    description: str,
    total_amount: int,
    paid_by: str,
    paid_by_name: str,
    category: str,
    date: str,
    participants: List[Dict[str, Any]]
):
    """분할 정산 생성"""
    try:
        print(f"📊 분할 정산 생성: {title}, {total_amount:,}원")
        
        expense_id = f"expense_{uuid.uuid4().hex[:8]}"
        
        split_expense = {
            "id": expense_id,
            "title": title,
            "description": description,
            "totalAmount": total_amount,
            "paidBy": paid_by,
            "paidByName": paid_by_name,
            "category": category,
            "date": date,
            "participants": participants,
            "status": "active",
            "createdAt": datetime.now().isoformat()
        }
        
        split_expenses_db[expense_id] = split_expense
        
        print(f"✅ 분할 정산 생성 완료: {expense_id}")
        
        return {
            "success": True,
            "expense": split_expense
        }
        
    except Exception as e:
        logger.error(f"분할 정산 생성 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분할 정산 생성 중 오류가 발생했습니다: {str(e)}")

@router.get("/split-expense")
async def get_split_expenses(user_id: str):
    """분할 정산 목록 조회"""
    try:
        print(f"📋 분할 정산 목록 조회: {user_id}")
        
        user_expenses = []
        for expense in split_expenses_db.values():
            # 사용자가 참여자이거나 지불자인 경우
            if (expense["paidBy"] == user_id or 
                any(p["userId"] == user_id for p in expense["participants"])):
                user_expenses.append(expense)
        
        # 최신순으로 정렬
        user_expenses.sort(key=lambda x: x["createdAt"], reverse=True)
        
        print(f"✅ 분할 정산 목록 조회 완료: {len(user_expenses)}건")
        
        return {
            "success": True,
            "expenses": user_expenses,
            "total_count": len(user_expenses)
        }
        
    except Exception as e:
        logger.error(f"분할 정산 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분할 정산 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/split-expense/{expense_id}")
async def get_split_expense_detail(expense_id: str):
    """분할 정산 상세 조회"""
    try:
        print(f"📊 분할 정산 상세 조회: {expense_id}")
        
        if expense_id not in split_expenses_db:
            raise HTTPException(status_code=404, detail="분할 정산을 찾을 수 없습니다.")
        
        expense = split_expenses_db[expense_id]
        
        print(f"✅ 분할 정산 상세 조회 완료: {expense_id}")
        
        return {
            "success": True,
            "expense": expense
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"분할 정산 상세 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분할 정산 상세 조회 중 오류가 발생했습니다: {str(e)}")

@router.post("/split-expense/{expense_id}/settle")
async def settle_split_expense(expense_id: str, user_id: str):
    """분할 정산 정산 처리"""
    try:
        print(f"💰 분할 정산 정산 처리: {expense_id}, 사용자: {user_id}")
        
        if expense_id not in split_expenses_db:
            raise HTTPException(status_code=404, detail="분할 정산을 찾을 수 없습니다.")
        
        expense = split_expenses_db[expense_id]
        
        # 사용자가 참여자인지 확인
        participant = next((p for p in expense["participants"] if p["userId"] == user_id), None)
        if not participant:
            raise HTTPException(status_code=403, detail="정산할 권한이 없습니다.")
        
        # 정산 처리
        participant["status"] = "paid"
        participant["paidAt"] = datetime.now().isoformat()
        
        # 모든 참여자가 정산했는지 확인
        all_settled = all(p["status"] == "paid" for p in expense["participants"])
        if all_settled:
            expense["status"] = "settled"
        
        print(f"✅ 분할 정산 정산 처리 완료: {expense_id}")
        
        return {
            "success": True,
            "message": "정산이 완료되었습니다.",
            "expense": expense
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"분할 정산 정산 처리 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분할 정산 정산 처리 중 오류가 발생했습니다: {str(e)}")

@router.post("/group-expense")
async def create_group_expense(
    name: str,
    description: str,
    members: List[Dict[str, Any]]
):
    """그룹 지출 생성"""
    try:
        print(f"👥 그룹 지출 생성: {name}")
        
        group_id = f"group_{uuid.uuid4().hex[:8]}"
        
        group_expense = {
            "id": group_id,
            "name": name,
            "description": description,
            "members": members,
            "expenses": [],
            "totalBalance": 0,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        group_expenses_db[group_id] = group_expense
        
        print(f"✅ 그룹 지출 생성 완료: {group_id}")
        
        return {
            "success": True,
            "group": group_expense
        }
        
    except Exception as e:
        logger.error(f"그룹 지출 생성 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"그룹 지출 생성 중 오류가 발생했습니다: {str(e)}")

@router.get("/group-expense")
async def get_group_expenses(user_id: str):
    """그룹 지출 목록 조회"""
    try:
        print(f"📋 그룹 지출 목록 조회: {user_id}")
        
        user_groups = []
        for group in group_expenses_db.values():
            # 사용자가 멤버인 경우
            if any(m["userId"] == user_id for m in group["members"]):
                user_groups.append(group)
        
        # 최신순으로 정렬
        user_groups.sort(key=lambda x: x["updatedAt"], reverse=True)
        
        print(f"✅ 그룹 지출 목록 조회 완료: {len(user_groups)}건")
        
        return {
            "success": True,
            "groups": user_groups,
            "total_count": len(user_groups)
        }
        
    except Exception as e:
        logger.error(f"그룹 지출 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"그룹 지출 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/group-expense/{group_id}")
async def get_group_expense_detail(group_id: str):
    """그룹 지출 상세 조회"""
    try:
        print(f"👥 그룹 지출 상세 조회: {group_id}")
        
        if group_id not in group_expenses_db:
            raise HTTPException(status_code=404, detail="그룹 지출을 찾을 수 없습니다.")
        
        group = group_expenses_db[group_id]
        
        print(f"✅ 그룹 지출 상세 조회 완료: {group_id}")
        
        return {
            "success": True,
            "group": group
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"그룹 지출 상세 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"그룹 지출 상세 조회 중 오류가 발생했습니다: {str(e)}")

@router.post("/group-expense/{group_id}/expense")
async def add_group_expense_item(
    group_id: str,
    title: str,
    amount: int,
    paid_by: str,
    paid_by_name: str,
    category: str,
    date: str,
    split_type: str = "equal",
    participants: List[str] = []
):
    """그룹에 지출 항목 추가"""
    try:
        print(f"➕ 그룹 지출 항목 추가: {group_id}, {title}, {amount:,}원")
        
        if group_id not in group_expenses_db:
            raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")
        
        group = group_expenses_db[group_id]
        
        expense_item = {
            "id": f"expense_{uuid.uuid4().hex[:8]}",
            "title": title,
            "amount": amount,
            "paidBy": paid_by,
            "paidByName": paid_by_name,
            "category": category,
            "date": date,
            "splitType": split_type,
            "participants": participants
        }
        
        group["expenses"].append(expense_item)
        group["updatedAt"] = datetime.now().isoformat()
        
        print(f"✅ 그룹 지출 항목 추가 완료: {expense_item['id']}")
        
        return {
            "success": True,
            "expenseItem": expense_item
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"그룹 지출 항목 추가 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"그룹 지출 항목 추가 중 오류가 발생했습니다: {str(e)}")

@router.post("/group-expense/{group_id}/settle")
async def settle_group_expense(group_id: str):
    """그룹 정산 처리"""
    try:
        print(f"💰 그룹 정산 처리: {group_id}")
        
        if group_id not in group_expenses_db:
            raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")
        
        group = group_expenses_db[group_id]
        
        # 그룹 내 잔액 계산
        balances = calculate_group_balances(group["expenses"], group["members"])
        group["members"] = balances
        
        # 총 잔액 계산
        total_balance = sum(m["balance"] for m in balances)
        group["totalBalance"] = total_balance
        
        print(f"✅ 그룹 정산 처리 완료: {group_id}, 총 잔액: {total_balance:,}원")
        
        return {
            "success": True,
            "message": "그룹 정산이 완료되었습니다.",
            "group": group,
            "settlement": calculate_optimal_settlement(balances)
        }
        
    except Exception as e:
        logger.error(f"그룹 정산 처리 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"그룹 정산 처리 중 오류가 발생했습니다: {str(e)}")

@router.post("/payment-reminder")
async def send_payment_reminder(
    expense_id: str,
    from_user_id: str,
    to_user_id: str,
    amount: int,
    message: str,
    due_date: str
):
    """결제 알림 전송"""
    try:
        print(f"📢 결제 알림 전송: {from_user_id} -> {to_user_id}, {amount:,}원")
        
        reminder_id = f"reminder_{uuid.uuid4().hex[:8]}"
        
        reminder = {
            "id": reminder_id,
            "expenseId": expense_id,
            "fromUserId": from_user_id,
            "toUserId": to_user_id,
            "amount": amount,
            "message": message,
            "dueDate": due_date,
            "status": "pending",
            "createdAt": datetime.now().isoformat()
        }
        
        payment_reminders_db[reminder_id] = reminder
        
        print(f"✅ 결제 알림 전송 완료: {reminder_id}")
        
        return {
            "success": True,
            "reminder": reminder
        }
        
    except Exception as e:
        logger.error(f"결제 알림 전송 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"결제 알림 전송 중 오류가 발생했습니다: {str(e)}")

@router.get("/payment-reminder")
async def get_payment_reminders(user_id: str):
    """결제 알림 목록 조회"""
    try:
        print(f"📢 결제 알림 목록 조회: {user_id}")
        
        user_reminders = []
        for reminder in payment_reminders_db.values():
            if reminder["fromUserId"] == user_id or reminder["toUserId"] == user_id:
                user_reminders.append(reminder)
        
        # 최신순으로 정렬
        user_reminders.sort(key=lambda x: x["createdAt"], reverse=True)
        
        print(f"✅ 결제 알림 목록 조회 완료: {len(user_reminders)}건")
        
        return {
            "success": True,
            "reminders": user_reminders,
            "total_count": len(user_reminders)
        }
        
    except Exception as e:
        logger.error(f"결제 알림 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"결제 알림 목록 조회 중 오류가 발생했습니다: {str(e)}")

# 유틸리티 함수들
def calculate_transfer_fee(amount: int, transfer_type: str) -> int:
    """송금 수수료 계산"""
    if transfer_type == "instant":
        # 즉시 송금: 금액의 0.1% (최소 100원, 최대 1,000원)
        fee = int(amount * 0.001)
        return min(max(fee, 100), 1000)
    else:
        # 예약 송금: 금액의 0.05% (최소 50원, 최대 500원)
        fee = int(amount * 0.0005)
        return min(max(fee, 50), 500)

def calculate_group_balances(expenses: List[Dict], members: List[Dict]) -> List[Dict]:
    """그룹 내 잔액 계산"""
    balances = {member["userId"]: 0 for member in members}
    
    for expense in expenses:
        paid_by = expense["paidBy"]
        total_amount = expense["amount"]
        
        # 지불한 사람의 잔액 증가
        balances[paid_by] += total_amount
        
        # 참여자들의 잔액 감소
        if expense["splitType"] == "equal":
            share_amount = total_amount / len(expense["participants"])
            for participant_id in expense["participants"]:
                if participant_id != paid_by:
                    balances[participant_id] -= share_amount
    
    # 멤버 정보 업데이트
    return [
        {**member, "balance": balances[member["userId"]]}
        for member in members
    ]

def calculate_optimal_settlement(members: List[Dict]) -> List[Dict[str, Any]]:
    """최적 정산 방안 계산"""
    settlements = []
    balances = members.copy()
    
    # 잔액이 양수인 사람과 음수인 사람을 분리
    creditors = [m for m in balances if m["balance"] > 0]
    debtors = [m for m in balances if m["balance"] < 0]
    
    creditors.sort(key=lambda x: x["balance"], reverse=True)
    debtors.sort(key=lambda x: x["balance"])
    
    creditor_idx = 0
    debtor_idx = 0
    
    while creditor_idx < len(creditors) and debtor_idx < len(debtors):
        creditor = creditors[creditor_idx]
        debtor = debtors[debtor_idx]
        
        amount = min(creditor["balance"], abs(debtor["balance"]))
        
        if amount > 0:
            settlements.append({
                "from": debtor["name"],
                "to": creditor["name"],
                "amount": amount,
            })
            
            creditor["balance"] -= amount
            debtor["balance"] += amount
            
            if creditor["balance"] == 0:
                creditor_idx += 1
            if debtor["balance"] == 0:
                debtor_idx += 1
    
    return settlements
