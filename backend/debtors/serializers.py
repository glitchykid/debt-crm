from rest_framework import serializers

from .models import Debtor, DebtorStatus, Payment


class CreateDebtorSerializer(serializers.ModelSerializer):
    incurredDate = serializers.DateField(source="incurred_date")
    dailyRate = serializers.DecimalField(source="daily_rate", max_digits=10, decimal_places=6)
    startDate = serializers.DateField(source="start_date")
    status = serializers.ChoiceField(choices=DebtorStatus.choices, required=False)

    class Meta:
        model = Debtor
        fields = ("name", "incurredDate", "principal", "dailyRate", "startDate", "status")


class AddPaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    date = serializers.DateField()


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=DebtorStatus.choices)


class PaymentResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("id", "amount", "date")
