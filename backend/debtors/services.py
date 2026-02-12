from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable

from .models import Debtor, DebtorStatus, Payment

MONEY_QUANT = Decimal("0.01")


@dataclass(frozen=True)
class DebtSnapshot:
    principal_remaining: Decimal
    interest_accrued: Decimal
    interest_paid: Decimal
    interest_remaining: Decimal
    total_debt: Decimal


def calculate_snapshot(debtor: Debtor, *, as_of: date | None = None) -> DebtSnapshot:
    as_of_date = as_of or date.today()
    principal_remaining = Decimal(debtor.principal)
    interest_accrued = Decimal("0")
    interest_paid = Decimal("0")
    current_date = debtor.start_date

    payments = debtor.payments.order_by("date", "created_at")
    for payment in payments:
        if payment.date > as_of_date:
            break

        days = max((payment.date - current_date).days, 0)
        if days > 0 and principal_remaining > 0:
            interest_accrued += principal_remaining * Decimal(debtor.daily_rate) * Decimal(days)

        interest_remaining_before_payment = max(interest_accrued - interest_paid, Decimal("0"))
        to_interest = min(Decimal(payment.amount), interest_remaining_before_payment)
        interest_paid += to_interest

        remainder = Decimal(payment.amount) - to_interest
        if remainder > 0:
            principal_remaining = max(principal_remaining - remainder, Decimal("0"))

        current_date = payment.date

    final_days = max((as_of_date - current_date).days, 0)
    if final_days > 0 and principal_remaining > 0:
        interest_accrued += principal_remaining * Decimal(debtor.daily_rate) * Decimal(final_days)

    interest_remaining = max(interest_accrued - interest_paid, Decimal("0"))
    total_debt = principal_remaining + interest_remaining

    return DebtSnapshot(
        principal_remaining=round_money(principal_remaining),
        interest_accrued=round_money(interest_accrued),
        interest_paid=round_money(interest_paid),
        interest_remaining=round_money(interest_remaining),
        total_debt=round_money(total_debt),
    )


def sync_status_with_snapshot(debtor: Debtor) -> Debtor:
    snapshot = calculate_snapshot(debtor)
    changed = False

    if snapshot.total_debt <= 0 and debtor.status != DebtorStatus.SETTLED:
        debtor.status = DebtorStatus.SETTLED
        changed = True
    elif snapshot.total_debt > 0 and debtor.status == DebtorStatus.SETTLED:
        debtor.status = DebtorStatus.ACTIVE
        changed = True

    if changed:
        debtor.save(update_fields=["status", "updated_at"])

    return debtor


def serialize_debtor_summary(debtor: Debtor) -> dict:
    snapshot = calculate_snapshot(debtor)
    return {
        "id": str(debtor.id),
        "name": debtor.name,
        "incurredDate": debtor.incurred_date.isoformat(),
        "principal": float(round_money(Decimal(debtor.principal))),
        "dailyRate": float(Decimal(debtor.daily_rate)),
        "startDate": debtor.start_date.isoformat(),
        "status": debtor.status,
        "interestDue": float(snapshot.interest_remaining),
        "totalDue": float(snapshot.total_debt),
    }


def serialize_debtor_details(debtor: Debtor) -> dict:
    snapshot = calculate_snapshot(debtor)
    payments = debtor.payments.order_by("-date", "-created_at")

    return {
        **serialize_debtor_summary(debtor),
        "payments": [serialize_payment(payment) for payment in payments],
        "snapshot": {
            "principalRemaining": float(snapshot.principal_remaining),
            "interestAccrued": float(snapshot.interest_accrued),
            "interestPaid": float(snapshot.interest_paid),
            "interestRemaining": float(snapshot.interest_remaining),
            "totalDebt": float(snapshot.total_debt),
        },
    }


def serialize_payment(payment: Payment) -> dict:
    return {
        "id": str(payment.id),
        "amount": float(round_money(Decimal(payment.amount))),
        "date": payment.date.isoformat(),
    }


def sync_statuses(debtors: Iterable[Debtor]) -> None:
    for debtor in debtors:
        sync_status_with_snapshot(debtor)


def round_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)
