from django.contrib import admin

from .models import Debtor, Payment


@admin.register(Debtor)
class DebtorAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "principal", "daily_rate", "start_date")
    list_filter = ("status",)
    search_fields = ("name",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("debtor", "amount", "date")
    list_filter = ("date",)
    search_fields = ("debtor__name",)
