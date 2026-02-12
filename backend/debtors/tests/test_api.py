from datetime import date
from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from debtors.models import Debtor, DebtorStatus, Payment


class DebtorApiTestCase(APITestCase):
    def setUp(self):
        self.debtor = Debtor.objects.create(
            name="ООО Альфа",
            incurred_date=date(2026, 1, 1),
            principal=Decimal("1000.00"),
            daily_rate=Decimal("0.001000"),
            start_date=date(2026, 1, 1),
            status=DebtorStatus.ACTIVE,
        )
        self.payment = Payment.objects.create(
            debtor=self.debtor,
            amount=Decimal("100.00"),
            date=date(2026, 1, 10),
        )

    def test_list_debtors_returns_summary(self):
        response = self.client.get(reverse("debtor-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn("interestDue", response.data[0])
        self.assertIn("totalDue", response.data[0])

    def test_create_debtor_uses_frontend_payload_shape(self):
        payload = {
            "name": "ИП Смирнов",
            "incurredDate": "2026-02-01",
            "principal": 2500,
            "dailyRate": "0.001200",
            "startDate": "2026-02-03",
            "status": "in_dispute",
        }

        response = self.client.post(reverse("debtor-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], payload["name"])
        self.assertEqual(response.data["status"], payload["status"])
        self.assertEqual(Debtor.objects.count(), 2)

    def test_get_debtor_detail_returns_snapshot_and_payments(self):
        response = self.client.get(reverse("debtor-detail", kwargs={"debtor_id": self.debtor.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(self.debtor.id))
        self.assertIn("snapshot", response.data)
        self.assertEqual(len(response.data["payments"]), 1)

    def test_add_payment_returns_updated_debtor_details(self):
        payload = {"amount": "50.00", "date": "2026-01-12"}
        response = self.client.post(
            reverse("debtor-payment-create", kwargs={"debtor_id": self.debtor.id}),
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.filter(debtor=self.debtor).count(), 2)
        self.assertEqual(len(response.data["payments"]), 2)

    def test_delete_payment_returns_updated_debtor_details(self):
        response = self.client.delete(
            reverse(
                "debtor-payment-delete",
                kwargs={"debtor_id": self.debtor.id, "payment_id": self.payment.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Payment.objects.filter(debtor=self.debtor).count(), 0)
        self.assertEqual(len(response.data["payments"]), 0)

    def test_close_status_endpoint_accepts_only_settled(self):
        invalid_response = self.client.patch(
            reverse("debtor-status-update", kwargs={"debtor_id": self.debtor.id}),
            {"status": "active"},
            format="json",
        )
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)

        valid_response = self.client.patch(
            reverse("debtor-status-update", kwargs={"debtor_id": self.debtor.id}),
            {"status": "settled"},
            format="json",
        )
        self.assertEqual(valid_response.status_code, status.HTTP_200_OK)
        self.debtor.refresh_from_db()
        self.assertEqual(self.debtor.status, DebtorStatus.SETTLED)

    def test_delete_debtor(self):
        response = self.client.delete(reverse("debtor-detail", kwargs={"debtor_id": self.debtor.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertFalse(Debtor.objects.filter(id=self.debtor.id).exists())
