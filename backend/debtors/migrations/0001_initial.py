from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Debtor",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255)),
                ("incurred_date", models.DateField()),
                ("principal", models.DecimalField(decimal_places=2, max_digits=12)),
                ("daily_rate", models.DecimalField(decimal_places=6, max_digits=10)),
                ("start_date", models.DateField()),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("in_dispute", "In Dispute"), ("settled", "Settled")],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Payment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("date", models.DateField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "debtor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="debtors.debtor",
                    ),
                ),
            ],
            options={"ordering": ["-date", "-created_at"]},
        ),
    ]
