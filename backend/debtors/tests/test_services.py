from datetime import date
from decimal import Decimal

from django.test import TestCase

from debtors.models import Debtor, DebtorStatus, Payment
from debtors.services import calculate_snapshot, sync_status_with_snapshot


class DebtServicesTestCase(TestCase):
    def test_calculate_snapshot_without_payments(self):
        debtor = Debtor.objects.create(
            name="Alpha",
            incurred_date=date(2026, 1, 1),
            principal=Decimal("1000.00"),
            daily_rate=Decimal("0.001000"),
            start_date=date(2026, 1, 1),
            status=DebtorStatus.ACTIVE,
        )

        snapshot = calculate_snapshot(debtor, as_of=date(2026, 1, 11))

        self.assertEqual(snapshot.principal_remaining, Decimal("1000.00"))
        self.assertEqual(snapshot.interest_accrued, Decimal("10.00"))
        self.assertEqual(snapshot.interest_remaining, Decimal("10.00"))
        self.assertEqual(snapshot.total_debt, Decimal("1010.00"))

    def test_calculate_snapshot_with_payment_split_between_interest_and_principal(self):
        debtor = Debtor.objects.create(
            name="Beta",
            incurred_date=date(2026, 1, 1),
            principal=Decimal("1000.00"),
            daily_rate=Decimal("0.001000"),
            start_date=date(2026, 1, 1),
            status=DebtorStatus.ACTIVE,
        )
        Payment.objects.create(debtor=debtor, amount=Decimal("20.00"), date=date(2026, 1, 11))

        snapshot = calculate_snapshot(debtor, as_of=date(2026, 1, 11))

        self.assertEqual(snapshot.interest_accrued, Decimal("10.00"))
        self.assertEqual(snapshot.interest_paid, Decimal("10.00"))
        self.assertEqual(snapshot.principal_remaining, Decimal("990.00"))
        self.assertEqual(snapshot.total_debt, Decimal("990.00"))

    def test_sync_status_with_snapshot_updates_to_settled_when_total_debt_zero(self):
        debtor = Debtor.objects.create(
            name="Gamma",
            incurred_date=date(2026, 1, 1),
            principal=Decimal("1000.00"),
            daily_rate=Decimal("0.001000"),
            start_date=date(2026, 1, 1),
            status=DebtorStatus.ACTIVE,
        )
        Payment.objects.create(debtor=debtor, amount=Decimal("2000.00"), date=date(2026, 1, 2))

        sync_status_with_snapshot(debtor)
        debtor.refresh_from_db()

        self.assertEqual(debtor.status, DebtorStatus.SETTLED)

    def test_sync_status_with_snapshot_reopens_settled_when_debt_exists(self):
        debtor = Debtor.objects.create(
            name="Delta",
            incurred_date=date(2026, 1, 1),
            principal=Decimal("1000.00"),
            daily_rate=Decimal("0.001000"),
            start_date=date(2026, 1, 1),
            status=DebtorStatus.SETTLED,
        )

        sync_status_with_snapshot(debtor)
        debtor.refresh_from_db()

        self.assertEqual(debtor.status, DebtorStatus.ACTIVE)
