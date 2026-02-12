import uuid

from django.db import models


class DebtorStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    IN_DISPUTE = "in_dispute", "In Dispute"
    SETTLED = "settled", "Settled"


class Debtor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    incurred_date = models.DateField()
    principal = models.DecimalField(max_digits=12, decimal_places=2)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=6)
    start_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=DebtorStatus.choices,
        default=DebtorStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.id})"


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    debtor = models.ForeignKey(Debtor, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.debtor_id} {self.amount} on {self.date}"
